# Hello! This is an AFK bot for Minecraft servers (even for Aternos)
## *This is a powerful AFK bot with many features*

## Installation
1.  Download or clone my repository to the folder where you want to install the bot.
2.  Go to this folder in an editor that supports JSON, and modify the parameters to your liking (what each parameter does, read in the "Config" section).
3.  Navigate to the bot's folder in your terminal (use the cd command on Windows, Linux, and macOS).
4.  Execute the command **npm install** and wait for the libraries to install.
5.  Execute the command **node index.js**

## Config
*The config looks something like this:*
{ 
  "server": {
    "host": "localhost",
    "port": 25565,
    "version": "1.16.5"
  },
  "auth": {
    "username": "AFKBot",
    "isCracked": true,
    "enabled": true,
    "inGamePassword": "your_strong_password_here"
  },
  "afk": {
    "enabled": true,
    "minDelaySeconds": 15,
    "maxDelaySeconds": 30,
    "moveDuration": 1000,
    "returnToOrigin": true,
    "jumpEnabled": true,
    "minJumpDelaySeconds": 5,
    "maxJumpDelaySeconds": 10
  },
  "coords": {
    "enabled": false,
    "x": 100,
    "y": 64,
    "z": 100,
    "tolerance": 2
  },
  "chat": {
    "enabled": true,
    "messages": [
      "AFK bot is online!",
      "Still here, just AFK.",
      "Greetings from the AFK realm!",
      "Having fun being AFK."
    ],
    "minDelaySeconds": 60,
    "maxDelaySeconds": 180
  },
  "reconnect": {
    "onKickDelaySeconds": 10,
    "onCrashDelaySeconds": 15,
    "autoRespawnDelaySeconds": 5
  },
  "periodicReconnect": {
    "enabled": true,
    "minDelayMinutes": 10,
    "maxDelayMinutes": 15
  },
  "web": {
    "port": 8000
  }
}


## But what does each parameter do?
### server: Server details.
    *   host: Server IP or domain.
    *   port: Server port.
    *   version: Minecraft version (e.g., "1.16.5", "1.20.1").
### auth: Authentication settings.
    *   username: Bot's name.
    *   isCracked: true for cracked (offline-mode) servers, false for premium (online-mode) servers.
    *   enabled: Is password authentication enabled.
    *   inGamePassword: Password for /reg and /l. Be sure to change it to your own!
### afk: AFK movement settings.
    *   enabled: Whether AFK movements are enabled.
    *   minDelaySeconds, maxDelaySeconds: Minimum and maximum delay between movements.
    *   moveDuration: How long (in milliseconds) should the bot move in a random direction. (1000 milliseconds = 1 second)
    *   returnToOrigin: Whether the bot should return to its original position after moving.
    *   jumpEnabled: Whether the bot should jump.
    *   minJumpDelaySeconds, maxJumpDelaySeconds: Delay between jumps.
### coords: Settings for moving to specific coordinates.
    *   enabled: Whether movement to coordinates is enabled.
    *   x, y, z: Target coordinates.
    *   tolerance: Permissible deviation from target coordinates (in blocks).
### chat: Settings for sending messages in chat.
    *   enabled: Whether sending messages is enabled.
    *   messages: List of messages the bot will send.
    *   minDelaySeconds, maxDelaySeconds: Delay between messages.
### reconnect: Reconnection settings.
    *   onKickDelaySeconds: Delay after being kicked.
    *   onCrashDelaySeconds: Delay after disconnection for another reason (e.g., server crash).
    *   autoRespawnDelaySeconds: Delay before respawning after death.
### periodicReconnect: Periodic reconnection settings.
    *   enabled: Whether it's enabled.
    *   minDelayMinutes, maxDelayMinutes: Minimum and maximum delay (in minutes) before rejoining the server.
### web: Web server settings.
    *   port: Port for the web interface.