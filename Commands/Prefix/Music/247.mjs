import EmbedBuilder from '../../../src/utils/classes/EmbedBuilder.mjs';

export default {
  ignore: false,
  name: '247',
  description: 'Toggle 24/7 mode for music (stub)',
  cooldown: 5,
  aliases: ['24/7', 'keepalive'],
  category: 'Music',
  permissions: {
    user: ['Connect', 'Speak'],
    bot: ['Connect', 'Speak'],
  },
  run: async ({ message, client, err, guildData }) => {
    try {
      const Embed = new EmbedBuilder(client).setTheme(guildData.Theme);
      return await message.safeReply({
        embeds: [
          Embed.setDescription(
            '!{i} 24/7 mode is not implemented yet. This project currently only provides a basic Lavalink queue/player skeleton.'
          ),
        ],
      });
    } catch (e) {
      err(e);
    }
  },
};

