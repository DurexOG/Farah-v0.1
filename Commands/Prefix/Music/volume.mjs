import EmbedBuilder from '../../../src/utils/classes/EmbedBuilder.mjs';

export default {
  ignore: false,
  name: 'volume',
  description: 'Set player volume (Lavalink plugin-dependent)',
  cooldown: 5,
  aliases: ['vol'],
  category: 'Music',
  permissions: {
    user: ['Connect', 'Speak'],
    bot: ['Connect', 'Speak'],
  },
  options: [
    {
      name: 'level',
      id: 'level',
      required: true,
      type: 'number',
    },
  ],
  run: async ({ message, client, err, options, guildData }) => {
    try {
      const level = options.get('level');
      const Embed = new EmbedBuilder(client).setTheme(guildData.Theme);

      const res = await client.lavalink?.setVolume?.(message.guild, level);

      // If setVolume is not implemented yet, show a safe message.
      if (!res) {
        return await message.safeReply({
          embeds: [
            Embed.setDescription(
              `!{i} Volume control is not implemented in this Lavalink wrapper yet. Required env/config varies by setup.`
            ),
          ],
        });
      }

      return await message.safeReply({
        embeds: [
          Embed.setDescription(res.ok ? `!{y}${res.message}` : `!{skull}${res.message}`),
        ],
      });
    } catch (e) {
      err(e);
    }
  },
};

