import { EmbedBuilder } from "../../../src/utils/index.mjs";
import logger from "../../../src/utils/logger.mjs";

/** @type {import("../../../src/utils/Command.mjs").prefix} */
export default {
  name: "noprefix",
  aliases: ["np"],
  cooldown: 3,
  ownerOnly: true,
  description: "Grant/Remove users ability to use prefix commands without prefix using .noprefix add <user> or .noprefix remove <user>",
  category: "OwnerOnly",
  run: async ({ message, client, err, guildData, args }) => {
    try {
      const sub = (args?.[0] || "").toLowerCase();
      const userIdOrMention = args?.[1];

      if (!sub || !["add", "remove"].includes(sub)) {
        return await message.safeReply({
          embeds: [
            new EmbedBuilder()
              .setTheme(guildData.Theme)
              .setColor(client.embed?.wrongcolor || "Red")
              .setTitle("Invalid Syntax")
              .setDescription(`Use:\n
gt; .noprefix add <@user|id>\n
gt; .noprefix remove <@user|id>`),
          ],
        });
      }

      if (!userIdOrMention) {
        return await message.safeReply({
          embeds: [
            new EmbedBuilder()
              .setTheme(guildData.Theme)
              .setColor(client.embed?.wrongcolor || "Red")
              .setDescription(`Missing user.\nUse: .noprefix ${sub} <@user|id>`),
          ],
        });
      }

      const match = String(userIdOrMention).match(/^<@!?(\d+)>$/) || String(userIdOrMention).match(/^(\d+)$/);
      const userId = match?.[1];
      if (!userId) {
        return await message.safeReply({
          embeds: [
            new EmbedBuilder()
              .setTheme(guildData.Theme)
              .setColor(client.embed?.wrongcolor || "Red")
              .setDescription(`Invalid user: ${userIdOrMention}`),
          ],
        });
      }

      const list = Array.isArray(guildData.Noprefix?.Users)
        ? guildData.Noprefix.Users
        : [];

      if (sub === "add") {
        if (list.includes(userId)) {
          return await message.safeReply({
            embeds: [
              new EmbedBuilder()
                .setTheme(guildData.Theme)
                .setColor("DarkGreen")
                .setDescription(`<@${userId}> already has noprefix access.`),
            ],
          });
        }

        list.push(userId);
        await client.db.Update(
          "GuildConfig",
          { Guild: message.guildId },
          {
            $set: {
              Noprefix: { Enable: true, Users: list },
            },
          },
          { upsert: true, new: true }
        );

        await message.safeReply({
          embeds: [
            new EmbedBuilder()
              .setTheme(guildData.Theme)
              .setColor("DarkGreen")
              .setDescription(`Granted noprefix access to <@${userId}>.`),
          ],
        });
      } else {
        const next = list.filter((id) => id !== userId);

        await client.db.Update(
          "GuildConfig",
          { Guild: message.guildId },
          {
            $set: {
              Noprefix: { Enable: true, Users: next },
            },
          },
          { upsert: true, new: true }
        );


        await message.safeReply({
          embeds: [
            new EmbedBuilder()
              .setTheme(guildData.Theme)
              .setColor("DarkRed")
              .setDescription(`Removed noprefix access from <@${userId}>.`),
          ],
        });
      }
    } catch (e) {
      logger(e, "error");
      err?.(e);
    }
  },
};

