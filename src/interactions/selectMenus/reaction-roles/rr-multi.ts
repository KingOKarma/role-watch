import { GuildMember } from "discord.js";
import SelectMenus from "../../../interfaces/selectMenus";

export const menu: SelectMenus = {
    name: "rr-multi",
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async (client, int) => {
        const [role] = int.values;
        const { member } = int;

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (role === undefined) return int.deferUpdate();
        if (!(member instanceof GuildMember)) return;

        const whitelist = client.whitelist.filter((wh) => wh.roleGroup === int.message.embeds[0].title && wh.serverID === int.guild?.id);

        if (whitelist.length > 0) {

            const hasWhitelistedRole = whitelist.some((wh) => member.roles.cache.has(wh.whitelistedRole));


            if (!hasWhitelistedRole) return void await int.reply({
                ephemeral: true, "embeds": [{
                    "color": client.primaryColour,
                    "description": `${int.member} You do not have the required role to get <@&${role}>,\nyou need one of these:\n${whitelist.map((r) => `<@&${r.whitelistedRole}>`).join(", ")}`
                }]
            });

        }

        try {

            if (role === "remove") {
                const assinedRoles = client.roles.filter((r) => member.roles.cache.has(r.roleID));

                if (assinedRoles.length === 0) return void await int.reply({
                    ephemeral: true, "embeds": [{
                        "color": client.primaryColour,
                        "description": `${int.member} You don't currently have any of these roles...`
                    }]
                });

                assinedRoles.forEach(async (r) => {
                    try {
                        await member.roles.remove(r.roleID);

                    } catch (err) {
                        return void await int.reply({
                            ephemeral: true, "embeds": [{
                                "color": client.primaryColour,
                                "description": `${int.member} There was an error when removing your roles please contact a staff member`
                            }]
                        });
                    }

                });
                return void await int.reply({
                    ephemeral: true, "embeds": [{
                        "color": client.primaryColour,
                        "description": `${int.member} Your roles have been removed. \nRemoved roles: \n${assinedRoles.map((r) => `<@&${r.roleID}>`).join(", ")}`
                    }]
                });
            }


            if (member.roles.cache.has(role)) {

                await member.roles.remove(role);
                await int.reply({
                    ephemeral: true, "embeds": [{
                        "color": client.primaryColour,
                        "description": `${int.member} Your <@&${role}> Role has been removed`
                    }]
                });

            } else {


                await member.roles.add(role);
                await int.reply({
                    ephemeral: true, "embeds": [{
                        "color": client.primaryColour,
                        "description": `${int.member} You have been given the <@&${role}> Role`
                    }]
                });
            }

        } catch (err) {
            await int.reply({
                ephemeral: true, "embeds": [{
                    "color": client.primaryColour,
                    "description": `${int.member} Could not assign the role <@&${role}>, Please contact staff for this error`
                }]
            });
        }

    }
};
