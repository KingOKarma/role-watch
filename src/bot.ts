import path from 'path';
import { Client } from 'discord.js-commando';
import { CONFIG } from './globals';
import {
  onMemberUpdate,
  onReady,
} from './events';

async function main() {
  const bot = new Client({
    commandPrefix: CONFIG.prefix,
  });

  bot.on('ready', () => onReady(bot));

  bot.on('guildMemberUpdate', onMemberUpdate);

  bot.registry.registerGroups([
    ['manager'],
  ]).registerDefaults()
    .registerCommandsIn(
      path.join(__dirname, 'commands'),
    );

  await bot.login(CONFIG.token);
}

main().catch(console.error);
