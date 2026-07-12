import { Message } from "discord.js";
import Bot from "../../client.mjs";

import {
  prefixHandler,
} from "../../utils/handlers/index.mjs";

import { logger, escapeRegex, } from "../../utils/index.mjs";

export default {
  name: "messageCreate",
  /**
   * @param {Bot} client - The Discord client.
   * @param {Message} message - The message object.
   */
  run: async (client, message) => {
    try {
      if (message.author.bot || message.system || !message.guild) return;

      const guildData = await message.guild.fetchData();
      const prefix = guildData?.Prefix || client.config.Prefix;
      const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})`);

      const isNoprefixUser =
        !!guildData?.Noprefix?.Enable &&
        Array.isArray(guildData?.Noprefix?.Users) &&
        guildData.Noprefix.Users.includes(message.author.id);

      // If user is NOT whitelisted, keep the old behavior (require prefix).
      if (!isNoprefixUser && !prefixRegex.test(message.content)) return;

      // If user IS whitelisted, parse first word as command name.
      let cmd;
      let args;
      let mPrefix;

      if (prefixRegex.test(message.content)) {
        ;[mPrefix] = message.content.match(prefixRegex);
        args = message.content.slice(mPrefix.length).trim().split(/ +/g);
        cmd = args.shift().toLowerCase();
      } else {
        const parts = message.content.trim().split(/ +/g);
        cmd = (parts.shift() || "").toLowerCase();
        args = parts;
        mPrefix = "";
      }


      let command =
        client.commands.get(cmd) ||
        client.commands.find((c) => c.aliases && c.aliases.includes(cmd)); //|| client.commands.get(client.aliases.get(cmd));


      return await prefixHandler(message, guildData, {
        cmd,
        command,
        args,
        prefix,
        mPrefix,
      });


    } catch (error) {
      logger(error, "error");
    }
  },
};
