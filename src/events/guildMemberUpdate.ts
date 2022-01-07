import { Event } from "../interfaces/index";
import { GuildMember } from "discord.js";


export const event: Event = {
    name: "guildMemberUpdate",
    run: async (client, _oldMem: GuildMember, newMem: GuildMember) => {
        const userRoles = newMem.roles.cache.map((role) => role.id);
        const rolesToRemove: string[] = [];

        // Loop over member roles to check if they have whitelisted roles
        client.roles.forEach((role) => {
            if (!userRoles.includes(role.roleID)) return;

            const roles = client.whitelist.filter((wh) => wh.roleGroup === role.roleGroup && newMem.guild.id === role.serverID);

            if (roles.length === 0) return;

            if (roles.some((wh) => userRoles.includes(wh.whitelistedRole))) return;

            rolesToRemove.push(role.roleID);

        });


        if (rolesToRemove.length === 0) return;

        // Loop over member roles to check if they have colour roles
        rolesToRemove.forEach(async (r) => {
            try {

                if (userRoles.includes(r)) {
                    await newMem.roles.remove(r, "Doesn't have required role");
                }

            } catch (err) {
                console.log(`Unable to remove ${newMem.user.tag}'s (${newMem.id}) Roles`);
            }

        });


    }
};
