import { Collection, Interaction, Message, MessageActionRow, MessageButton } from "discord.js";
import { Command } from "../../interfaces";

const pageTracker: Collection<string, number> = new Collection();

export const command: Command = {
    description: "Manage the whitelist !",
    example: ["!whitelist list", "!whitelist add @role", "!whitelist remove @role"],
    group: "manager",
    name: "whitelist",
    permissionsBot: ["MANAGE_ROLES"],
    permissionsUser: ["MANAGE_ROLES"],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async (client, msg, args) => {
        const [selection] = args;

        switch (selection ? selection.toLowerCase() : "none") {

            case "list": {
                const whitelistList = client.arrayPage(client.whitelist, 10, 1);

                let finalPage = 1;
                let notMax = false;
                while (!notMax) {
                    const cmds = client.arrayPage(client.whitelist, 10, finalPage);
                    if (cmds.length !== 0) {
                        finalPage++;
                    } else {
                        notMax = true;
                    }
                }
                finalPage -= 1;

                let buttons;

                pageTracker.set(msg.author.id, 1);
                let page = pageTracker.get(msg.author.id) ?? 1;

                const left = new MessageButton()
                    .setCustomId("left-whitelist")
                    .setEmoji("◀️")
                    .setLabel((page - 1).toString())
                    .setStyle("PRIMARY")
                    .setDisabled(true);


                const right = new MessageButton()
                    .setCustomId("right-whitelist")
                    .setEmoji("▶️")
                    .setLabel((page + 1).toString())
                    .setStyle("PRIMARY");

                if (finalPage < 2) right.setDisabled(true);

                if (finalPage !== 0) {


                    buttons = [new MessageActionRow()
                        .setComponents(
                            left, right
                        )];

                }


                const msgEmbed = await client.embedReply(msg, {
                    embed: {
                        "title": "List of Whitelisted Roles",
                        "description": whitelistList.map((c) => `⦾ **${c.roleGroup}** <@&${c.whitelistedRole}>`).join("\n")
                    }, "components": buttons
                });

                if (!(msgEmbed instanceof Message)) return;

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const filter = (intr: Interaction): boolean => intr.user.id === msg.author.id;
                const collector = msgEmbed.createMessageComponentCollector({ filter, time: 30000, componentType: "BUTTON", dispose: true });


                collector.on("collect", async (i) => {
                    page = pageTracker.get(msg.author.id) ?? 1;

                    switch (i.customId) {

                        case "right-whitelist": {
                            page++;
                            await i.deferUpdate();
                            left.setLabel((page - 1).toString()).setDisabled(false);

                            right.setLabel((page + 1).toString());
                            if (finalPage - 1 === page) right.setDisabled(true);

                            buttons = [new MessageActionRow()
                                .setComponents(
                                    left, right
                                )];

                            const pagedWhitelistList = client.arrayPage(client.whitelist, 10, page);

                            await msgEmbed.edit({
                                "components": buttons, embeds: [{
                                    "title": "List of Whitelisted Roles",
                                    "description": pagedWhitelistList.map((c) => `⦾ **${c.roleGroup}** <@&${c.whitelistedRole}>`).join("\n")
                                }]
                            });
                            pageTracker.set(msg.author.id, page);

                            break;
                        }
                        case "left-whitelist": {
                            page--;
                            await i.deferUpdate();
                            left.setLabel((page - 1).toString());
                            if (page < 0) left.setDisabled(true);

                            right.setLabel((page + 1).toString()).setDisabled(false);

                            buttons = [new MessageActionRow()
                                .setComponents(
                                    left, right
                                )];

                            const pagedWhitelistList = client.arrayPage(client.whitelist, 10, page);

                            await msgEmbed.edit({
                                "components": buttons, embeds: [{
                                    "title": "List of Whitelisted Roles",
                                    "description": pagedWhitelistList.map((c) => `⦾ **${c.roleGroup}** <@&${c.whitelistedRole}>`).join("\n")
                                }]
                            });
                            pageTracker.set(msg.author.id, page);
                            break;

                        }
                        default: {
                            await i.deferUpdate();
                            await msgEmbed.delete();
                            await client.commandFailed(msg);
                            break;

                        }
                    }
                });

                collector.on("end", async () => {
                    page = pageTracker.get(msg.author.id) ?? 1;
                    const pagedWhitelistList = client.arrayPage(client.whitelist, 10, page);

                    await msgEmbed.edit({
                        embeds: [{
                            "title": "List of Whitelisted Roles",
                            "description": pagedWhitelistList.map((c) => `⦾ **${c.roleGroup}** <@&${c.whitelistedRole}>`).join("\n"),
                            "footer": { "text": "Page buttons have timed out" }
                        }]
                    });
                    pageTracker.delete(msg.author.id);
                }
                );

                return;
            }

            case "add": {

            }

            case "remove": {

            }

            default: {
                return client.embedReply(msg, { embed: {
                    "color": "RED",
                    "description": "Please specify either \"list\", \"add\" or \"remove\" eg: `whitelist list`"
                } });
            }


        }
    }
};