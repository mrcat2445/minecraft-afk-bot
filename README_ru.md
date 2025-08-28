# Привет! Это АФК бот для серверов Minecraft (даже для Aternos)
## *Это мощный АФК бот с множеством функций*

## Установка
1. Скачайте или клонируйте мой репозиторий в папку, куда вы хотите установить бота.
2. Зайдите в эту папку в редакторе, который поддерживает JSON, и измените параметры на свой вкус (что делает каждый параметр, читайте в пункте "Конфиг")
3. Зайдите в папку с ботом в терминале (используйте команду cd на Windows, Linux и MacOS)
4. Выполните команду **npm install** и дождитесь установки библиотек
5. Выполните команду **node index.js**

## Конфиг
*Конфиг выглядит примерно так:*
{ 
  "server": {
    "host": "localhost",
    "port": 25565,
    "version": "1.16.5"
  },
  "auth": {
    "username": "AFKBot",
    "isCracked": true,
    "inGamePassword": "your_strong_password_here"
  },
  "afk": {
    "enabled": true,
    "minDelaySeconds": 15,
    "maxDelaySeconds": 30,
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

## Но что делает каждый параметр?
###  server: Данные сервера.
    *   host: IP или домен сервера.
    *   port: Порт сервера.
    *   version: Версия Minecraft (например, "1.16.5", "1.20.1").
###  auth: Настройки аутентификации.
    *   username: Имя бота.
    *   isCracked: true для пиратских серверов (offline-mode), false для лицензионных (online-mode).
    *   enabled: Включена ли авторизация через пароль.
    *   inGamePassword: Пароль для /reg и /l. Обязательно измените его на свой!
###  afk: Настройки AFK-движений.
    *   enabled: Включены ли AFK-движения.
    *   minDelaySeconds, maxDelaySeconds: Минимальная и максимальная задержка между движениями.
    *   returnToOrigin: Должен ли бот возвращаться на исходную позицию после движения.
    *   jumpEnabled: Должен ли бот прыгать.
    *   minJumpDelaySeconds, maxJumpDelaySeconds: Задержка между прыжками.
###  coords: Настройки движения к определенным координатам.
    *   enabled: Включено ли движение к координатам.
    *   x, y, z: Целевые координаты.
    *   tolerance: Допустимое отклонение от целевых координат (в блоках).
###  chat: Настройки отправки сообщений в чат.
    *   enabled: Включена ли отправка сообщений.
    *   messages: Список сообщений, которые бот будет отправлять.
    *   minDelaySeconds, maxDelaySeconds: Задержка между сообщениями.
###  reconnect: Настройки переподключения.
    *   onKickDelaySeconds: Задержка после кика.
    *   onCrashDelaySeconds: Задержка после отключения по другой причине (например, краш сервера).
    *   autoRespawnDelaySeconds: Задержка перед респауном после смерти.
###  periodicReconnect: Настройки периодического переподключения.
    *   enabled: Включено ли.
    *   minDelayMinutes, maxDelayMinutes: Минимальная и максимальная задержка (в минутах) перед перезаходом на сервер.
###  web: Настройки веб-сервера.
    *   port: Порт для веб-интерфейса.