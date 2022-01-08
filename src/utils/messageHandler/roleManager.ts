import ExtendedClient from "../../client/client";
import { Message } from "discord.js";

export const messageRoleManager = (msg: Message, client: ExtendedClient): void => {
    if (!msg.member) return;
    const userRoles = msg.member.roles.cache.map((role) => role.id);
    const rolesToRemove: string[] = [];

    // Loop over member roles to check if they have whitelisted roles
    client.roles.forEach((role) => {
        if (!userRoles.includes(role.roleID)) return;

        const roles = client.whitelist.filter((wh) => wh.roleGroup === role.roleGroup && msg.guild?.id === role.serverID);

        if (roles.length === 0) return;

        if (roles.some((wh) => userRoles.includes(wh.whitelistedRole))) return;

        rolesToRemove.push(role.roleID);

    });


    if (rolesToRemove.length === 0) return;

    // Loop over member roles to check if they have colour roles
    rolesToRemove.forEach(async (r) => {
        try {

            if (userRoles.includes(r)) {
                await msg.member?.roles.remove(r, "Doesn't have required role");
            }

        } catch (err) {
            console.log(`Unable to remove ${msg.author.tag}'s (${msg.author.id}) Roles`);
        }

    });
};