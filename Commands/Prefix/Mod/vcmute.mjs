import EmbedBuilder from '../../../src/utils/classes/EmbedBuilder.mjs';
import ModUtils from '../../../src/utils/classes/ModUtils.mjs';

export default {
  ignore: false,
  name: 'vcmute',
  description: "mute Specified Member in Voice Channels",
  cooldown: 5,
  aliases: ['vc-mute', 'vcmute', 'chup'],
  category: 'Moderation',
  permissions: {
    user: ['ModerateMembers'],
    bot: ['ModerateMembers'],
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

      const response = await vMute(message.member, target, reason);

      await msg.safeEdit({
        embeds: [Embed.setDescription(response)],
      });
    } catch (error) {
      err(error);
    }
  },
};

async function vMute(issuer, target, reason) {
  if (issuer.user.id === target.user.id)
    return `^{command.mute.self}`;

  const response = await ModUtils.vMuteTarget(issuer, target, reason);

  if (typeof response === 'boolean')
    return `!{y} ${target.user.username}'s voice is muted in this server`;
  if (response === 'MemberPerm')
    return `!{i} You do not have permission to voice mute ${target.user.username}`;
  if (response === 'BotPerm')
    return `!{i} I do not have permission to voice mute ${target.user.username}`;
  if (response === 'NoVoice')
    return `!{i} ${target.user.username} is not in any voice channel`;
  if (response === 'Already')
    return `!{i} ${target.user.username} is already muted`;

  return `!{i} Failed to voice mute ${target.user.username}`;
}

