import { SlashCommands } from "../../../interfaces/slashCommands";

export const slashCommand: SlashCommands = {
    defaultPermission: false,
    description: "Test that the bot works",
    guildOnly: true,
    name: "ping",

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async(client, intr) => {

        await client.embedReply(intr, { ephemeral: true, "embed": { "title": "Ping! 🏓" } });
        return intr.editReply({ "embeds": [{ "title": `🏓Latency is ${Date.now() - intr.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms` }] });

    }
};