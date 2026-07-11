import { ActivityType, Events } from "discord.js";

import logger, { webhookLog } from "../utils/logger.mjs";
import {
  EmbedBuilder,
  XCounter,
  instaCounter,
  onlineCounter,
  postReddit,
  redditFeed,
  totalCounter,
} from "../utils/index.mjs";
import { invite } from "../utils/invite.mjs";
import Bot from "../client.mjs";
import {
  AutoAnnounceHandler,
  BirthdayHandler,
  SocialMediaHandler,
} from "../utils/handlers/index.mjs";

export default {
  name: Events.ClientReady,
  runOnce: true,

  /**
   *
   * @param {Bot} client
   */
  run: async (client) => {
    logger(`Logged in as ${client.user.tag}!`.cyan.bold);

    const setFuturisticPresence = () => {
      const guildCount = client.guilds.cache.size;
      client.user.setPresence({
        status: client.config.Status,
        activities: [
          {
            type: ActivityType.Listening,
            name: `.help | farah-v0.2`,
          },
          {
            type: ActivityType.Watching,
            name: `watching ${guildCount} servers exactly`,
          },
        ],
      });
    };

    // Initial presence + autoswitch every 10s
    setFuturisticPresence();

    let switchIdx = 0;
    const tick = () => {
      const guildCount = client.guilds.cache.size;
      const activity = switchIdx % 2 === 0
        ? { type: ActivityType.Listening, name: `.help | farah-v0.2` }
        : { type: ActivityType.Watching, name: `watching ${guildCount} servers exactly` };

      client.user.setPresence({
        status: client.config.Status,
        activities: [activity],
      });
      switchIdx++;
    };

    setInterval(tick, 10 * 1000);


    const process2 = async () => {
      const data = await client.db.Find("GuildConfig");
      await SocialMediaHandler(client, data);
      await BirthdayHandler(client, data);

      client.guilds.cache.forEach((guild) => {
        invite.updateInvites(guild);
        postReddit(guild);
        // guild.invites.fetch().then(console.log)
      });
    };

    // const process3 = () => client.db.Find("GuildConfig").then((data) => AutoAnnounceHandler(client, data));

    await Promise.all([process2()]);

    // setInterval(process3, 60 * 1000);
    setInterval(async () => await Promise.all([process2()]), 15 * 60 * 1000);

    webhookLog(
      {
        embeds: [
          new EmbedBuilder()
            .setColor("Blurple")
            .setAuthor({
              name: client.user.tag,
              iconURL: client.user.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(
              `${client.user.username} is Online Since <t:${~~(
                Date.now() / 1000
              )}:R>`
            ),
        ],
      },
      "Ready"
    );
  },
};
