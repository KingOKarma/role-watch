import { Command } from "../../interfaces";

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