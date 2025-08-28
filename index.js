const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals: { GoalNear } } = require('mineflayer-pathfinder');
const Vec3 = require('vec3').Vec3;
const fs = require('fs');
const express = require('express');
const logger = require('./logger'); // Custom logger

let config;
try {
    config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
    logger.info("[INFO] Configuration loaded successfully!");
} catch (e) {
    logger.critical(`[CRITICAL] Failed to load config.json: ${e.message}!`);
    process.exit(1);
}

let bot;
let initialBotPosition = null;
let initialLoginDone = false; // To track if /reg has been done
let afkTimeout, jumpTimeout, chatTimeout, periodicReconnectTimeout, movementTimeout, returnTimeout;
let serverStatus = {
    host: config.server.host,
    port: config.server.port,
    ping: 'N/A',
    isOnline: false,
    username: config.auth.username
};

const app = express();

// Helper to clear all active timers
function clearAllTimers() {
    clearTimeout(afkTimeout);
    clearTimeout(jumpTimeout);
    clearTimeout(chatTimeout);
    clearTimeout(periodicReconnectTimeout);
    clearTimeout(movementTimeout);
    clearTimeout(returnTimeout);
    logger.debug("[DEBUG] All bot timers cleared.");
}

// Function to create and connect the bot
function createBot() {
    if (bot && bot.end) { // Ensure bot exists and has .end method
        clearAllTimers();
        try {
            bot.end('Reconnecting...'); // Attempt to gracefully disconnect existing bot
            logger.info("[INFO] Existing bot instance ended for reconnection.");
        } catch (e) {
            logger.warn(`[WARNING] Error while ending existing bot: ${e.message}!`);
        }
    }

    serverStatus.isOnline = false;
    serverStatus.ping = 'N/A';
    
    bot = mineflayer.createBot({
        host: config.server.host,
        port: config.server.port,
        username: config.auth.username,
        auth: config.auth.isCracked ? 'offline' : 'mojang',
        version: config.server.version,
        hideErrors: false,
    });

    bot.loadPlugin(pathfinder);
    setupBotEvents(bot);
}

// Setup all event listeners for the bot
function setupBotEvents(botInstance) {
    botInstance.on('spawn', () => {
        logger.info(`[INFO] Bot spawned on ${botInstance.host}:${botInstance.port}!`);
        serverStatus.isOnline = true;
        initialBotPosition = botInstance.entity.position.clone();
        
        // Setup pathfinder movements
        const defaultMove = new Movements(botInstance, require('minecraft-data')(botInstance.version).blocks);
        botInstance.pathfinder.setMovements(defaultMove);

        // Handle authentication
        if (config.auth.enabled) {
            handleAuthentication();
        }

        // Start AFK activities
        if (config.afk.enabled) {
            startAfkLoop();
        }
        if (config.afk.jumpEnabled) {
            startJumpLoop();
        }
        if (config.chat.enabled) {
            startChatLoop();
        }
        if (config.periodicReconnect.enabled) {
            startPeriodicReconnect();
        }
        if (config.coords.enabled) {
        goToCoords();
        }
    });

    botInstance.on('login', () => {
        logger.info(`[INFO] Bot logged in as ${botInstance.username}!`);
    });

    botInstance.on('kicked', (reason) => {
        logger.error(`[ERROR] Bot was kicked from the server. Reason: ${reason}!`);
        clearAllTimers();
        serverStatus.isOnline = false;
        serverStatus.ping = 'N/A';
        logger.info(`[INFO] Reconnecting in ${config.reconnect.onKickDelaySeconds} seconds...`);
        setTimeout(createBot, config.reconnect.onKickDelaySeconds * 1000);
    });

    botInstance.on('end', (reason) => {
        if (!['kick', 'Reconnecting...'].includes(reason)) { // Don't log kick twice, or the internal reconnect msg
            logger.warn(`[WARNING] Bot disconnected. Reason: ${reason}!`);
            clearAllTimers();
            serverStatus.isOnline = false;
            serverStatus.ping = 'N/A';
            logger.info(`[INFO] Reconnecting in ${config.reconnect.onCrashDelaySeconds} seconds...`);
            setTimeout(createBot, config.reconnect.onCrashDelaySeconds * 1000);
        }
    });

    botInstance.on('error', (err) => {
        logger.error(`[ERROR] Bot encountered an error: ${err.message}!`);
        // The 'end' event usually follows this for connection errors, handling reconnection.
    });

    botInstance.on('death', () => {
        logger.warn(`[WARNING] Bot died!`);
        clearAllTimers();
        serverStatus.ping = 'N/A'; // Ping might reset
        if (config.reconnect.autoRespawnDelaySeconds > 0) {
            logger.info(`[INFO] Respawning in ${config.reconnect.autoRespawnDelaySeconds} seconds...`);
            setTimeout(() => {
                botInstance.chat('/respawn'); // Some servers use this
                // Or simply triggering a control state can respawn:
                botInstance.setControlState('forward', true);
                // setTimeout(() => botInstance.setControlState('forward', false), 500);
            }, config.reconnect.autoRespawnDelaySeconds * 1000);
        }
    });

    botInstance.on('chat', (username, message) => {
        if (username === botInstance.username) return; // Don't log own messages twice
        logger.info(`[CHAT] <${username}>: ${message}`);
    });

    botInstance.on('physicsTick', () => {
        if (botInstance.player) {
            serverStatus.ping = botInstance.player.ping;
        }
    });
}

// Handle in-game authentication
async function handleAuthentication() {
    const password = config.auth.inGamePassword;
    if (!password) {
        logger.warn("[WARNING] No inGamePassword provided in config.json. Skipping in-game authentication.");
        return;
    }

    if (!initialLoginDone) {
        logger.info("[INFO] Attempting to register...");
        await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay
        bot.chat(`/reg ${password} ${password}`);
        logger.info("[INFO] Sent /reg command.");
        await new Promise(resolve => setTimeout(resolve, 2000)); // Give server time to process reg
        bot.chat(`/l ${password}`);
        logger.info("[INFO] Sent /l command after registration attempt.");
        initialLoginDone = true;
    } else {
        logger.info("[INFO] Attempting to login...");
        await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay
        bot.chat(`/l ${password}`);
        logger.info("[INFO] Sent /l command.");
    }
}

// AFK Movement functions
function startAfkLoop() {
    const randomDelay = (Math.random() * (config.afk.maxDelaySeconds - config.afk.minDelaySeconds) + config.afk.minDelaySeconds) * 1000;
    movementTimeout = setTimeout(async () => {
        logger.debug("[DEBUG] Starting AFK movement sequence.");
        const directions = ['forward', 'back', 'left', 'right'];
        const randomDir = directions[Math.floor(Math.random() * directions.length)];
        const moveDuration = config.afk.moveDuration; // Move for ? ms (1s = 1000ms)

        logger.info(`[INFO] Moving ${randomDir}!`);
        bot.setControlState(randomDir, true);
        await new Promise(resolve => setTimeout(resolve, moveDuration));
        bot.setControlState(randomDir, false);
        logger.info(`[INFO] Stopped moving ${randomDir}.`);

        if (config.afk.returnToOrigin && initialBotPosition) {
            logger.info("[INFO] Returning to initial position.");
            try {
                await bot.pathfinder.goto(new GoalNear(initialBotPosition.x, initialBotPosition.y, initialBotPosition.z, 0.5));
                logger.info("[INFO] Returned to initial position successfully.");
            } catch (err) {
                logger.error(`[ERROR] Failed to return to origin: ${err.message}!`);
            }
        }
        
        startAfkLoop(); // Schedule next movement
    }, randomDelay);
    logger.debug(`[DEBUG] Next AFK movement scheduled in ${Math.round(randomDelay / 1000)} seconds.`);
}

// AFK Jump function
function startJumpLoop() {
    const randomDelay = (Math.random() * (config.afk.maxJumpDelaySeconds - config.afk.minJumpDelaySeconds) + config.afk.minJumpDelaySeconds) * 1000;
    jumpTimeout = setTimeout(() => {
        logger.info("[INFO] Jumping!");
        bot.setControlState('jump', true);
        setTimeout(() => bot.setControlState('jump', false), 100); // Hold jump for 100ms
        startJumpLoop(); // Schedule next jump
    }, randomDelay);
    logger.debug(`[DEBUG] Next jump scheduled in ${Math.round(randomDelay / 1000)} seconds.`);
}

// Chatting function
function startChatLoop() {
    if (config.chat.messages.length === 0) {
        logger.warn("[WARNING] No chat messages configured. Skipping chat loop.");
        return;
    }
    const randomDelay = (Math.random() * (config.chat.maxDelaySeconds - config.chat.minDelaySeconds) + config.chat.minDelaySeconds) * 1000;
    chatTimeout = setTimeout(() => {
        const randomMessage = config.chat.messages[Math.floor(Math.random() * config.chat.messages.length)];
        logger.info(`[INFO] Sending chat message: "${randomMessage}"`);
        bot.chat(randomMessage);
        startChatLoop(); // Schedule next message
    }, randomDelay);
    logger.debug(`[DEBUG] Next chat message scheduled in ${Math.round(randomDelay / 1000)} seconds.`);
}

// Periodic Reconnect function
function startPeriodicReconnect() {
    const randomDelay = (Math.random() * (config.periodicReconnect.maxDelayMinutes - config.periodicReconnect.minDelayMinutes) + config.periodicReconnect.minDelayMinutes) * 60 * 1000;
    periodicReconnectTimeout = setTimeout(() => {
        logger.info("[INFO] Performing periodic server reconnect!");
        createBot(); // Reconnects the bot
    }, randomDelay);
    logger.debug(`[DEBUG] Periodic reconnect scheduled in ${Math.round(randomDelay / (60 * 1000))} minutes.`);
}

// Move to specific coordinates function
async function goToCoords() {
    const target = new Vec3(config.coords.x, config.coords.y, config.coords.z);
    logger.info(`[INFO] Moving to coordinates: X=${target.x}, Y=${target.y}, Z=${target.z}!`);
    try {
        await bot.pathfinder.goto(new GoalNear(target.x, target.y, target.z, config.coords.tolerance));
        logger.info("[INFO] Reached target coordinates successfully!");
    } catch (err) {
        logger.error(`[ERROR] Failed to reach target coordinates: ${err.message}!`);
    }
}

// --- Web Server ---
app.get('/', (req, res) => {
    logger.debug("[DEBUG] Web request to / received.");
    res.send('<h1>Bot is arrived</h1>');
});

app.get('/status', (req, res) => {
    logger.debug("[DEBUG] Web request to /status received.");
    const statusMessage = `Bot is arrived: ${serverStatus.isOnline ? 'ONLINE' : 'OFFLINE'} on server ${serverStatus.host}:${serverStatus.port}, bot's ping: ${serverStatus.ping}ms`;
    res.send(`<h1>${statusMessage}</h1>`);
});

app.listen(config.web.port, () => {
    logger.info(`[INFO] Web server running on http://localhost:${config.web.port}!`);
});

// Initial bot
creation
createBot();
