import { EmbedBuilder } from "discord.js";
import axios from "axios";

export default {
  name: [
    "highfive",
    "happy",
    "sleep",
    "handhold",
    "laugh",
    "bite",
    "poke",
    "tickle",
    "kiss",
    "wave",
    "thumbsup",
    "stare",
    "cuddle",
    "smile",
    "lurk",
    "baka",
    "blush",
    "nom",
    "peck",
    "handshake",
    "think",
    "pout",
    "facepalm",
    "yawn",
    "wink",
    "shoot",
    "smug",
    "nope",
    "cry",
    "pat",
    "nod",
    "punch",
    "dance",
    "feed",
    "shrug",
    "kick",
    "hug",
    "yeet",
    "slap",
    "neko",
    "husbando",
    "kitsune",
    "waifu",
    "suck",
    "finger",
    "dada",
  ],
  cooldown: 5,
  description: "React on somesone as {commandName}",
  category: "Fun",
  options: [
    {
      id: "user",
      type: "user",
      name: "@User / Mention Someone",
      required: false,
    },
  ],
  run: async ({ message, client, err, args, command, options }) => {
    try {
      const user = options?.get?.("user");

      // const errMsg = async () =>
      //   await message.reply({
      //     embeds: [
      //       new EmbedBuilder().setDescription(
      //         `${client?.emotes?.x ?? ""} Got an error! try again later`
      //       ),
      //     ],
      //   });

      const reactionName = command?.name;
      if (!reactionName) return errMsg();

      let response;
      try {
        response = await axios.get(
          `https://nekos.best/api/v2/${reactionName}`,
          {
            headers: {
              // Some hosts block requests without a user-agent header
              "User-Agent": client?.user ? `DiscordBot/${client.user.id}` : "DiscordBot",
            },
            timeout: 10000,
          }
        );
      } catch (e) {
        // If nekos.best blocks/403, fail gracefully instead of throwing
        if (axios?.isAxiosError?.(e) && e?.response?.status === 403) return errMsg();
        throw e;
      }


      const url =
        response?.data?.results?.[0]?.url ??
        response?.data?.result?.[0]?.url;

      if (!url) return errMsg();

      await message
        .reply({
          embeds: [
            new EmbedBuilder()
              .setImage(url)
              .setTitle("Reaction")
              .setDescription(
                `${message?.author?.toString?.() ?? "Someone"} ${
                  reactionName
                } ${user ? `On <@${user.id}>` : `: ${reactionName}`}`
              ),
          ],
        })
        .catch((e) => err?.(e));
    } catch (error) {
      err?.(error);
    }
  },
};

