import fs from 'fs';
import { safeDump, safeLoad } from 'js-yaml';
import { CONFIG } from './globals';

/**
 * This represents the config.yml
 * @class Config
 * @property {string} token
 * @property {string} prefix
 * @property {string[]} t3roleID
 * @property {string[]} roles
 */
export default class Config {
    public readonly token: string;

    public readonly prefix: string;

    public readonly t3roleID: string[];

    public readonly roles: string[];

    public readonly guildID: string;

    private static LOCATION = './config.yml';

    constructor() {
      this.token = '';
      this.prefix = '';
      this.t3roleID = [''];
      this.roles = [''];
      this.guildID = '';
    }

    /**
     * Call getConfig instead of constructor
     */
    public static getConfig(): Config {
      if (!fs.existsSync(Config.LOCATION)) {
        throw new Error('Please create a config.yml');
      }

      const fileContents = fs.readFileSync(
        Config.LOCATION,
        'utf-8',
      );
      const casted = safeLoad(fileContents) as Config;

      return casted;
    }

    /**
     * Safe the config to the config.yml default location
     */
    public static saveConfig() {
      fs.writeFileSync(Config.LOCATION, safeDump(CONFIG));
    }
}
