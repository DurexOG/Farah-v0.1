import EmbedBuilder from '../../../src/utils/classes/EmbedBuilder.mjs';
import ModUtils from '../../../src/utils/classes/ModUtils.mjs';

export default {
  ignore: false,
  name: 'vckick',
  description: "disconnect Specified Member from Voice Channels",
  cooldown: 5,
  aliases: ['vc-kick', 'vckick', 'bhagja'],
  category: 'Moderation',
  permissions: {
    user: ['KickMembers'],
    bot: ['KickMembers'],
  },
  options: [
    {
      name: '@User/UserId/Username',
      id: 'user',
      required: true,
      type: 'member',
    },
    {
      name: 'Reason',
      id: 'reason',
      required: false,
      type: 'string',
    },
  ],
  run: async ({ message, client, err, options, guildData }) => {
    try {
      const target = options.get('user');
      const reason = options.get('reason') || 'Not Specified';
      const Embed = new EmbedBuilder(client).setTheme(guildData.Theme);

      const msg = await message.safeReply({
        embeds: [Embed.setDescription('^{common.loading}')],
      });

      const response = await vckick(message.member, target, reason);

      await msg.safeEdit({
        embeds: [Embed.setDescription(response)],
      });
    } catch (error) {
      err(error);
    }
  },
};

async function vckick(issuer, target, reason) {
  if (issuer.user.id === target.user.id)
    return `^{command.disconect.self}`;

  const response = await ModUtils.disconnectTarget(issuer, target, reason);

  if (typeof response === 'boolean') return `^{command.disconect.success}`;
  if (response === 'BotPerm') return `^{command.disconect.botPerm}`;
  if (response === 'MemberPerm') return `^{command.disconect.userPerm}`;
  if (response === 'NoVoice') return `^{command.disconect.noVoice}`;
  return `^{command.disconect.error}`;
}

