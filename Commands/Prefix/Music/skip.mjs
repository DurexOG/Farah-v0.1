import EmbedBuilder from '../../../src/utils/classes/EmbedBuilder.mjs';

export default {
  ignore: false,
  name: 'skip',
  description: 'Skip current track',
  cooldown: 5,
  aliases: ['next'],
  category: 'Music',
  permissions: {
    user: ['Connect', 'Speak'],
    bot: ['Connect', 'Speak'],
  },
  run: async ({ message, client, err, guildData }) => {
    try {
      const Embed = new EmbedBuilder(client).setTheme(guildData.Theme);
      const vc = message.member.voice?.channel;
      if (!vc) return message.safeReply({ embeds: [Embed.setDescription('!{i} Join a voice channel first')] });

      const res = await client.lavalink.skip(message.guild, message.member.user);
      return await message.safeReply({ embeds: [Embed.setDescription(res.ok ? `!{y}${res.message}` : `!{skull} ${res.message}`)] });
    } catch (e) {
      err(e);
    }
  },
};

