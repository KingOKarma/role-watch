import { Command } from "../../interfaces";
import { Roles } from "../../entity/roles";
import { getRepository } from "typeorm";
import { getRole } from "../../utils/getRole";

export const command: Command = {
    aliases: ["rdesc"],
    description: "Assign a description to roles within the role assign selections, and view them\n"
        + "Note you may use \"none\" and \"colour/color\" to reset the description or set it to the colour of the role",
    example: ["!roledesc @role This role is for announcements", "!roledesc @role", "!roles @role #ffa56be"],
    group: "manager",
    name: "roledesc",
    permissionsBot: ["MANAGE_ROLES"],
    permissionsUser: ["MANAGE_ROLES"],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async (client, msg, args) => {

        const argRole = args.shift();

        const role = await getRole(argRole, msg.guild);

        if (!role) return client.embedReply(msg, {
            embed: {
                description: "Please specify a role that you want to assign/view the descripton for",
                color: "RED"
            }
        });

        if (!client.roles.some((r) => r.roleID === role.id)) return client.embedReply(msg, {
            "embed": {
                description: `The role ${role} does not exist on the roles list, please ensure the role exists on the \`role list\` command`
            }
        });

        const rolesRepo = getRepository(Roles);

        try {
            const dbRole = await rolesRepo.findOne({ where: { roleID: role.id, serverID: msg.guild?.id ?? "1" } });
            if (dbRole === undefined) return await client.commandFailed(msg);

            switch (args.length === 0) {

                case true: {
                    return await client.embedReply(msg, {
                        embed: {
                            title: `${role.name}'s Role Description`,
                            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                            description: dbRole.description ?? "No description set"
                        }
                    });
                }

                case false: {

                    switch (args[0].toLowerCase()) {
                        case "none": {
                            dbRole.description = null;
                            await rolesRepo.save(dbRole);
                            return await client.embedReply(msg, {
                                embed: {
                                    title: `${role.name}'s role Description`,
                                    description: "Has been unset"
                                }
                            });
                        }

                        case "colour": {
                            dbRole.description = "colour";
                            await rolesRepo.save(dbRole);
                            return await client.embedReply(msg, {
                                embed: {
                                    title: `${role.name}'s New role Description`,
                                    description: "The description will now be the colour"
                                }
                            });
                        }
                        case "color": {
                            dbRole.description = "colour";
                            await rolesRepo.save(dbRole);
                            return await client.embedReply(msg, {
                                embed: {
                                    title: `${role.name}'s New role Description`,
                                    description: "The description will now be the color"
                                }
                            });
                        }

                        default: {
                            dbRole.description = args.join(" ");
                            await rolesRepo.save(dbRole);
                            return await client.embedReply(msg, {
                                embed: {
                                    title: `${role.name}'s New role Description`,
                                    description: dbRole.description
                                }
                            });
                        }
                    }


                }
            }

        } catch (err) {
            return client.embedReply(msg, {
                embed: {
                    description: "There was an error please try again!",
                    color: "RED"
                }
            });
        }
    }

};