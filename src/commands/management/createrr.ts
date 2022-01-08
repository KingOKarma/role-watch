import { MessageActionRow, MessageSelectMenu, MessageSelectOptionData } from "discord.js";
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

        const option: MessageSelectOptionData = {
            "label": "Remove All Roles",
            "value": "remove",
            "description": "Use this to remove all of your roles from this list"
        };

        selectionRoles.push(option);

        const selection = new MessageSelectMenu();
        selection.setCustomId("rr-selection");
        selection.setPlaceholder("Select Your Roles");
        selection.setOptions(selectionRoles);
        selection.setMinValues(0);
        selection.setMaxValues(1);

        menu.setComponents(selection);

        return msg.channel.send({
            embeds: [{
                "title": roles[0].roleGroup,
                "description": "Select your role(s)",
                "color": client.primaryColour
            }],
            components: [menu]
        });


    }
};
