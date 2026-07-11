import EmbedBuilder from '../../../src/utils/classes/EmbedBuilder.mjs';
import ModUtils from '../../../src/utils/classes/ModUtils.mjs';

export default {
  ignore: false,
  name: 'vcdef',
  description: "deafen Specified Member in Voice Channels",
  cooldown: 5,
  aliases: ['vc-deafen', 'vcdef'],
  category: 'Moderation',
  permissions: {
    user: ['DeafenMembers'],
    bot: ['DeafenMembers'],
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

      const response = await deafen(message.member, target, reason);

      await msg.safeEdit({
        embeds: [Embed.setDescription(response)],
      });
    } catch (error) {
      err(error);
    }
  },
};

async function deafen(issuer, target, reason) {
  if (issuer.user.id === target.user.id)
    return `^{command.defean.self}`;

  const response = await ModUtils.deafenTarget(issuer, target, reason);

  if (typeof response === 'boolean') return `^{command.defean.success}`;
  if (response === 'MemberPerm') return `^{command.defean.userPerm}`;
  if (response === 'BotPerm') return `^{command.defean.botPerm}`;
  if (response === 'NoVoice') return `^{command.defean.noVoice}`;
  if (response === 'Already') return `^{command.defean.already}`;
  return `^{command.defean.error}`;
}

