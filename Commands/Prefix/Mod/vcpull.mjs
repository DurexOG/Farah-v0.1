import EmbedBuilder from '../../../src/utils/classes/EmbedBuilder.mjs';
import ModUtils from '../../../src/utils/classes/ModUtils.mjs';

export default {
  ignore: false,
  name: 'vcpull',
  description: 'pull a user to your current voice channel',
  cooldown: 5,
  aliases: ['cometome', 'pull'],
  category: 'Moderation',
  permissions: {
    user: ['MoveMembers'],
    bot: ['MoveMembers'],
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

      const response = await vcpull(message.member, target, reason);

      await msg.safeEdit({
        embeds: [Embed.setDescription(response)],
      });
    } catch (error) {
      err(error);
    }
  },
};

async function vcpull(issuer, target, reason) {
  const voiceChannel = issuer.voice?.channel;
  if (!voiceChannel) return '!{i} You are not in a voice channel';
  if (issuer.user.id === target.user.id) return '!{i} You cannot pull your self';

  const response = await ModUtils.moveTarget(issuer, target, reason, voiceChannel);

  if (typeof response === 'boolean') return `!{y} Pulled ${target.user.username} to your voice channel`;
  if (response === 'MemberPerm') return '!{i} You do not have permission to move the target';
  if (response === 'BotPerm') return '!{i} I do not have permission to move the target';
  if (response === 'NoVoice') return `!{i} ${target.user.username} is not in any voice channel`;
  if (response === 'TargetPerm') return '!{i} The target don\'t have permission to join that channel';
  if (response === 'Already') return '!{i} The user is already in your voice channel';

  return '!{i} Failed to pull the target';
}

