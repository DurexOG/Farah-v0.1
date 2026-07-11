import EmbedBuilder from '../../../src/utils/classes/EmbedBuilder.mjs';

export default {
  ignore: false,
  name: 'queue',
  description: 'Show current queue',
  cooldown: 5,
  aliases: ['q', 'tracks'],
  category: 'Music',
  permissions: {
    user: ['ViewChannel'],
    bot: ['ViewChannel'],
  },
  options: [
    {
      name: 'limit',
      id: 'limit',
      required: false,
      type: 'number',
    },
  ],
  run: async ({ message, client, err, options, guildData }) => {
    try {
      const limit = options.get('limit') || 10;
      const Embed = new EmbedBuilder(client).setTheme(guildData.Theme);

      const data = await client.lavalink.getQueueView(message.guild.id, limit);

      const desc = [
        `Status: ${data.status}`,
        data.nowPlaying ? `Now Playing: **${data.nowPlaying}**` : 'Now Playing: none',
        `Queue (${data.total}):`,
        data.tracks.length ? data.tracks.join('\n') : '—',
      ].join('\n');

      return await message.safeReply({ embeds: [Embed.setDescription(desc)] });
    } catch (e) {
      err(e);
    }
  },
};

