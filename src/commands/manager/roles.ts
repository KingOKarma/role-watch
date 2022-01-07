import { Collection, Interaction, Message, MessageActionRow, MessageButton, Role } from "discord.js";
import { Command } from "../../interfaces";
import { getRole } from "../../utils/getRole";
import { Roles } from "../../entity/roles";
import { getRepository } from "typeorm";

const pageTracker: Collection<string, number> = new Collection();
export const command: Command = {
    aliases: ["roles"],
    description: "Manage the assignable roles!",
    example: ["!roles list", "!roles add @role", "!roles remove @role"],
    group: "manager",
    name: "roles",
    permissionsBot: ["MANAGE_ROLES"],
    permissionsUser: ["MANAGE_ROLES"],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async (client, msg, args) => {

        const [selection] = args;

        const rolesRepo = getRepository(Roles);

        switch (selection ? selection.toLowerCase() : "none") {

            case "list": {
                const rolesList = client.arrayPage(client.roles, 10, 1);

                let finalPage = 1;
                let notMax = false;
                while (!notMax) {
                    const cmds = client.arrayPage(client.roles, 10, finalPage);
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
                    .setCustomId("left-roles")
                    .setEmoji("◀️")
                    .setLabel((page - 1).toString())
                    .setStyle("PRIMARY")
                    .setDisabled(true);


                const right = new MessageButton()
                    .setCustomId("right-roles")
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
                        "title": "List of Roles",
                        "description": rolesList.map((c) => `⦾ **${c.roleGroup}** <@&${c.roleID}>`).join("\n")
                    }, "components": buttons
                });

                if (!(msgEmbed instanceof Message)) return;

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const filter = (intr: Interaction): boolean => intr.user.id === msg.author.id;
                const collector = msgEmbed.createMessageComponentCollector({ filter, time: 30000, componentType: "BUTTON", dispose: true });


                collector.on("collect", async (i) => {
                    page = pageTracker.get(msg.author.id) ?? 1;

                    switch (i.customId) {

                        case "right-roles": {
                            page++;
                            await i.deferUpdate();
                            left.setLabel((page - 1).toString()).setDisabled(false);

                            right.setLabel((page + 1).toString());
                            if (finalPage - 1 === page) right.setDisabled(true);

                            buttons = [new MessageActionRow()
                                .setComponents(
                                    left, right
                                )];

                            const pagedRolesList = client.arrayPage(client.roles, 10, page);

                            await msgEmbed.edit({
                                "components": buttons, embeds: [{
                                    "title": "List of Roles",
                                    "description": pagedRolesList.map((c) => `⦾ **${c.roleGroup}** <@&${c.roleID}>`).join("\n")
                                }]
                            });
                            pageTracker.set(msg.author.id, page);

                            break;
                        }
                        case "left-roles": {
                            page--;
                            await i.deferUpdate();
                            left.setLabel((page - 1).toString());
                            if (page < 0) left.setDisabled(true);

                            right.setLabel((page + 1).toString()).setDisabled(false);

                            buttons = [new MessageActionRow()
                                .setComponents(
                                    left, right
                                )];

                            const pagedRolesList = client.arrayPage(client.roles, 10, page);

                            await msgEmbed.edit({
                                "components": buttons, embeds: [{
                                    "title": "List of Roles",
                                    "description": pagedRolesList.map((c) => `⦾ **${c.roleGroup}** <@&${c.roleID}>`).join("\n")
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
                    const pagedRolesList = client.arrayPage(client.roles, 10, page);

                    await msgEmbed.edit({
                        embeds: [{
                            "title": "List of Roles",
                            "description": pagedRolesList.map((c) => `⦾ **${c.roleGroup}** <@&${c.roleID}>`).join("\n"),
                            "footer": { "text": "Page buttons have timed out" }
                        }]
                    });
                    pageTracker.delete(msg.author.id);
                }
                );

                return;
            }


            case "add": {
                args.shift();
                const failText = "**Please mention a role(s) to add**,\n> If you want to add multiple roles you may use the command like this:\n`> roles add @role1 @role2 @role3\`"
                if (args.length === 0) {
                    return client.embedReply(msg, {
                        embed: {
                            "color": "RED",
                            "description": failText
                        }
                    })
                }
                const roles: Role[] = [];

                const promise = new Promise<void>((resolve, reject) => {
                    args.forEach(async (r, index, arr) => {
                        const role = await getRole(r, msg.guild);
                        if (role === null) {
                            reject();
                        }
                        roles.push(role as Role);

                        if (index === arr.length - 1) resolve();
                    });
                })

                try {
                    await promise;

                } catch (err) {
                    return client.embedReply(msg, {
                        embed: {
                            "color": "RED",
                            "description": failText
                        }
                    })
                }

                const alreadyOnList: string[] = [];
                const waitForroles = new Promise<void>((resolve, reject) => {

                    roles.forEach(async (r, index, arr) => {

                        let dbRole = await rolesRepo.findOne({ where: { "serverID": msg.guild?.id ?? "1", "roleID": r.id } })

                        if (dbRole === undefined) {
                            const newRole = new Roles();
                            newRole.roleGroup = "Default";
                            newRole.roleID = r.id;
                            newRole.serverID = msg.guild?.id ?? "1";
                            await rolesRepo.save(newRole);
                            dbRole = newRole
                        } else {
                            dbRole.roleGroup = "Default";
                            await rolesRepo.save(dbRole);
                            alreadyOnList.push(r.id);
                        }
                        if (index === arr.length - 1) resolve();

                    })
                })
                try {
                    await waitForroles;

                } catch (err) {
                    return client.commandFailed(msg);
                }

                const listORoles = await client.embedReply(msg, {
                    embed: {
                        "title": "Adding Roles",
                        "description": roles.map((r) => {
                            if (alreadyOnList.includes(r.id)) return `⦾ ${r} (Already on list)`
                            return `⦾ ${r}`
                        }).join("\n"),
                        "fields": [{
                            "name": "We're not done yet!",
                            "value": "> What is the name of the group you are assigning these roles to? Please type below\n"
                        }]
                    }
                });

                const filter = (m: Message): boolean => m.author.id === msg.author.id;
                try {
                    const message = await msg.channel.awaitMessages({ filter, time: 30000, "dispose": true, errors: ["time"], max: 1 });
                    const msgComp = message.first();
                    if (msgComp === undefined) return client.commandFailed(msg);

                    const waitForroles = new Promise<void>((resolve, reject) => {

                        roles.forEach(async (r, index, arr) => {

                            let dbRole = await rolesRepo.findOne({ where: { "serverID": msg.guild?.id ?? "1", "roleID": r.id } })

                            if (dbRole === undefined) {
                                const newRole = new Roles();
                                newRole.roleGroup = msgComp.content;
                                newRole.roleID = r.id;
                                newRole.serverID = msg.guild?.id ?? "1";
                                await rolesRepo.save(newRole);
                                dbRole = newRole
                            } else {
                                dbRole.roleGroup = msgComp.content;
                                await rolesRepo.save(dbRole);
                            }

                            if (listORoles instanceof Message) {
                                const newList = listORoles.embeds[0].setDescription(roles.map((r) => {
                                    if (alreadyOnList.includes(r.id)) return `⦾ **${dbRole?.roleGroup}** ${r} (Already on list)`
                                    return `⦾ **${dbRole?.roleGroup}** ${r}`
                                }).join("\n"))
                                await listORoles.edit({ embeds: [newList] }).catch((err) => client.commandFailed(msg))

                            }

                            if (index === arr.length - 1) resolve();

                        })
                    })
                    try {
                        await waitForroles;

                    } catch (err) {
                        return client.commandFailed(msg);
                    }


                    return client.embedReply(msg, {
                        embed: {
                            "description": `I set the group for the roles to **${msgComp.content}**`
                        }
                    });


                } catch (err) {

                    return client.embedReply(msg, {
                        embed: {
                            "description": "You didn't send any message so I set the group to \"Default\", you can change this by running the same command and setting the new group.",
                            color: "RED"
                        }
                    });
                }
            }

            case "remove": {
                break;
            }

            default: {
                return client.embedReply(msg, {
                    embed: {
                        "color": "RED",
                        "description": "Please specify either \"list\", \"add\" or \"remove\" eg: `roles list`"
                    }
                });
            }


        }
    }
};
