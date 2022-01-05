import { Client, GuildMember, PartialGuildMember } from 'discord.js';
import { CONFIG } from './globals';
import { validate } from './utils';

export async function onReady(bot: Client): Promise<void> {
  let guild;
  
  if (!bot.user) {
    return;
  }
  
  console.log(`${bot.user.tag} is online!`);
  await bot.user.setActivity('your colour(s)', { type: 'WATCHING' });

  try {
    guild = await bot.guilds.fetch(CONFIG.guildID);
  } catch (e) {
    console.log(`Failed to get guild from config "${CONFIG.guildID}"`);
    return;
  }

  const members = await guild.members.fetch();
  const tasks = [];

  for (let member of members.values()) {
    let task = validate(member);
    tasks.push(task);
  }

  await Promise.all(tasks);
}

/**
 * Triggered when a member updates their profile info
 * @param {PartialGuildMember | GuildMember} _ (not needed)
 * @param {GuildMember} mem New iteration of the member's profile
 */
export async function onMemberUpdate(
  _: PartialGuildMember | GuildMember,
  mem: GuildMember,
): Promise<void> {
  // check if this guild is one of the targets
  if (mem.guild.id !== CONFIG.guildID) {
    return;
  }

  await validate(mem);
}

