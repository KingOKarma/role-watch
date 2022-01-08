import { Message, MessageActionRow, MessageSelectMenu, MessageSelectOptionData } from "discord.js";
import { Command } from "../../interfaces";
import { getRole } from "../../utils/getRole";

export const command: Command = {
    aliases: ["rr"],
    description: "Create a role assign menu from a group",
    example: ["!createrr"],
    group: "management",
    name: "createrr",
    permissionsBot: ["MANAGE_ROLES"],
    permissionsUser: ["MANAGE_ROLES"],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async (client, msg, args) => {

        const [group] = args;

        if (!group) {
            return client.embedReply(msg, {
                embed: {
                    "description": "Please name a group from one of your role's lists, \n> You can view all of your role groups via `colour list`",
                    "color": "RED"
                }
            });
        }

        const roles = client.roles.filter((r) => r.roleGroup === group && r.serverID === msg.guild?.id);

        if (roles.length === 0) return client.embedReply(msg, {
            embed: {
                "description": "Could not find that group, \n> You can view all of your role groups via `colour list`",
                "color": "RED"
            }
        });

        const menu = new MessageActionRow();
        const selectionRoles: MessageSelectOptionData[] = [];
        const promise = new Promise<void>((resolve, reject) => {

            roles.forEach(async (r, index, arr) => {

                const role = await getRole(r.roleID, msg.guild);
                if (role === null) return void reject(r.roleID);

                const option: MessageSelectOptionData = {
                    "label": role.name,
                    "value": r.roleID,
                    "description": role.hexColor
                };

                selectionRoles.push(option);

                if (index === arr.length - 1) resolve();
            });
        });

        try {
            await promise;

        } catch (err) {
            return client.embedReply(msg, {
                embed: {
                    description: `<@&${err}> Could not be found, does the role still exist?`
                }
            });
        }
        let choice;
        const relpy = await client.embedReply(msg, { embed: { "description": "Nearly done!, Now please specify either \"selection\" or \"multi\" to choose the type of role assign" } });
        const filter = (m: Message): boolean => m.author.id === msg.author.id && m.content.toLowerCase() === "selection" || m.content.toLowerCase() === "multi";
        try {
            const message = await msg.channel.awaitMessages({ filter, time: 30000, "dispose": true, errors: ["time"], max: 1 });
            choice = message.first()?.content;
            await message.first()?.delete();
            if (relpy instanceof Message) await relpy.delete();

        } catch (err) {
            return client.embedReply(msg, { embed: { "description": "The command canceld as you failed to specify either \"selection\" or \"multi\"" } });
        }
        const selection = new MessageSelectMenu();

        switch (choice) {
            case "selection": {

                const option: MessageSelectOptionData = {
                    "label": "Remove Current Role",
                    "value": "remove",
                    "description": "Use this to remove your current role"
                };

                selectionRoles.push(option);

                selection.setCustomId("rr-selection");
                selection.setPlaceholder("Select Your Roles");
                selection.setOptions(selectionRoles);
                selection.setMaxValues(1);
                break;

            }
            case "multi": {
                const option: MessageSelectOptionData = {
                    "label": "Remove All Roles",
                    "value": "remove",
                    "description": "Use this to remove all of your roles from this list"
                };

                selectionRoles.push(option);

                selection.setCustomId("rr-multi");
                selection.setPlaceholder("Select Your Roles");
                selection.setOptions(selectionRoles);
                selection.setMaxValues(1);
                break;
            }
            default: {
                return client.commandFailed(msg);
            }
        }


        menu.setComponents(selection);

        return msg.channel.send({
            embeds: [{
                "title": roles[0].roleGroup,
                "description": "Select your role(s)",
                "color": client.primaryColour,
                "footer": { "text": choice }
            }],
            components: [menu]
        });


    }
};
