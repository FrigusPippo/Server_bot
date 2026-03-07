const mineflayer = require("mineflayer");
const { Movements, pathfinder, goals } = require("mineflayer-pathfinder");
const { GoalBlock } = goals;
const config = require("./settings.json");

console.log("Starting bot...");

function startBot() {
  const bot = mineflayer.createBot({
    host: config.server.ip,                 // Tropadoicetea02.aternos.me
    port: config.server.port,               // 19867
    username: config["bot-account"].username, // "Bot"
    auth: "offline",                        // cracked mode
    version: config.server.version          // 1.21.11
  });

  bot.loadPlugin(pathfinder);

  bot.on("login", () => {
    console.log("[Bot] Logged in!");
  });

  bot.on("spawn", () => {
    console.log("[Bot] Spawned in the world!");
  });

  bot.on("error", (err) => {
    console.log("[Bot Error]", err);
  });

  bot.on("end", () => {
    console.log("[Bot] Disconnected. Reconnecting in 5 seconds...");
    setTimeout(startBot, 5000);
  });
}

startBot();
