import EmbedBuilder from '../../../src/utils/classes/EmbedBuilder.mjs';
import ModUtils from '../../../src/utils/classes/ModUtils.mjs';

export default {
  ignore: false,
  name: 'vcunmuteall',
  description: "unmute all non-bot members from your voice channel",
  cooldown: 5,
  aliases: ['vc-unmute-all', 'unmuteall', 'sabbolo'],
  category: 'Moderation',
  permissions: {
    user: ['ModerateMembers'],
    bot: ['ModerateMembers'],
  },
  options: [
    {
      name: 'Reason',
      id: 'reason',
      required: false,
      type: 'string',
    },
  ],
  run: async ({ message, client, err, options, guildData }) => {
    try {
      const reason = options.get('reason') || 'Not Specified';
      const Embed = new EmbedBuilder(client).setTheme(guildData.Theme);

      const msg = await message.safeReply({
        embeds: [Embed.setDescription('^{common.loading}')],
      });

      const response = await vcUnmuteAll(message.member, reason);

      await msg.safeEdit({
        embeds: [Embed.setDescription(response)],
      });
    } catch (error) {
      err(error);
    }
  },
};

async function vcUnmuteAll(issuer, reason) {
  const fromChannel = issuer.voice?.channel;
  if (!fromChannel) return '!{i} You are not in a voice channel';

  const members = fromChannel.members;
  const nonBots = members.filter((m) => !m.user.bot);

  if (nonBots.size === 0) return '!{i} No non-bot members to unmute';

  let unmuted = 0;
  for (const member of nonBots.values()) {
    const res = await ModUtils.vUnmuteTarget(issuer, member, reason).catch(() => null);
    if (res === true || typeof res === 'boolean') unmuted++;
  }

  return `!{y} Unmuted **${unmuted}/${nonBots.size}** members in ${fromChannel.name}`;
}

