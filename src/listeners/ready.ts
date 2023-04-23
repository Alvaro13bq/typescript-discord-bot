import { Client } from "discord.js";

export default (client: Client): void => {
    client.on("ready", () => {
        if (!client.user || !client.application) return;

    console.log(`Logged in as ${client.user.tag}!`);
    });
};
