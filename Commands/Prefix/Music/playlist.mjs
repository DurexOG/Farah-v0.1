import EmbedBuilder from '../../../src/utils/classes/EmbedBuilder.mjs';

export default {
  ignore: false,
  name: 'playlist',
  description: 'Show playlist info (Lavalink plugin-dependent). For now, it enqueues the given playlist link/query.',
  cooldown: 5,
  aliases: ['pl'],
  category: 'Music',
  permissions: {
    user: ['Connect', 'Speak'],
    bot: ['Connect', 'Speak'],
  },
  options: [
    {
      name: 'query',
      id: 'query',
      required: true,
      type: 'string',
    },
  ],
  run: async ({ message, client, err, options, guildData }) => {
    try {
      const query = options.get('query');
      const Embed = new EmbedBuilder(client).setTheme(guildData.Theme);

      const vc = message.member.voice?.channel;
      if (!vc) return message.safeReply({ embeds: [Embed.setDescription('!{i} Join a voice channel first')] });

      // Many Lavalink Spotify/Youtube plugins will expand playlists.
      const res = await client.lavalink.play(message.guild, query, message.member.user);

      return await message.safeReply({
        embeds: [Embed.setDescription(res.ok ? `!{y}${res.message}` : `!{skull} ${res.message}`)],
      });
    } catch (e) {
      err(e);
    }
  },
};

