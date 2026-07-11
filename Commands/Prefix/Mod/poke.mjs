import EmbedBuilder from '../../../src/utils/classes/EmbedBuilder.mjs';

export default {
  ignore: false,
  name: 'poke',
  description: 'poke a member (text interaction)',
  cooldown: 5,
  aliases: ['poke-user', 'vcpoke'],
  category: 'Moderation',
  permissions: {
    user: ['ViewChannel'],
    bot: ['ViewChannel'],
  },
  options: [
    {
      name: '@User/UserId/Username',
      id: 'user',
      required: true,
      type: 'member',
    },
    {
      name: 'Message',
      id: 'text',
      required: false,
      type: 'string',
    },
  ],
  run: async ({ message, client, err, options, guildData }) => {
    try {
      const target = options.get('user');
      const text = options.get('text') || 'hey!';
      const Embed = new EmbedBuilder(client).setTheme(guildData.Theme);

      const msg = await message.safeReply({
        embeds: [Embed.setDescription('^{common.loading}')],
      });

      const response = await poke(message.member, target, text);

      await msg.safeEdit({
        embeds: [Embed.setDescription(response)],
      });
    } catch (error) {
      err(error);
    }
  },
};

async function poke(issuer, target, text) {
  if (issuer.user.id === target.user.id) return '!{i} You cannot poke yourself';

  const content = `**${issuer.user.username}** poked **${target.user.username}**: ${text}`;

  // Try DM first, fallback to reply.
  await target
    .send({ content })
    .catch(async () => {
      // ignore
    });

  return `!{y} Poked ${target.user.username}`;
}

