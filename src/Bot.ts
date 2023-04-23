import { Client } from "discord.js";
require("dotenv").config();

const token = process.env.TOKEN;

console.log("Bot is starting...");

const client = new Client({
    intents: []
});

client.login(token);
