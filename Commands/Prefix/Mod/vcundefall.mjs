import EmbedBuilder from '../../../src/utils/classes/EmbedBuilder.mjs';
import ModUtils from '../../../src/utils/classes/ModUtils.mjs';

export default {
  ignore: false,
  name: 'vcundefall',
  description: "undeafen all non-bot members from your voice channel",
  cooldown: 5,
  aliases: ['vc-undef-all', 'undeafenall', 'vc-undeafen-all'],
  category: 'Moderation',
  permissions: {
    user: ['DeafenMembers'],
    bot: ['DeafenMembers'],
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

      const response = await vcUndefAll(message.member, reason);

      await msg.safeEdit({
        embeds: [Embed.setDescription(response)],
      });
    } catch (error) {
      err(error);
    }
  },
};

async function vcUndefAll(issuer, reason) {
  const fromChannel = issuer.voice?.channel;
  if (!fromChannel) return '!{i} You are not in a voice channel';

  const members = fromChannel.members;
  const nonBots = members.filter((m) => !m.user.bot);

  if (nonBots.size === 0) return '!{i} No non-bot members to undeafen';

  let undeafened = 0;
  for (const member of nonBots.values()) {
    const res = await ModUtils.unDeafenTarget(issuer, member, reason).catch(() => null);
    if (res === true || typeof res === 'boolean') undeafened++;
  }

  return `!{y} Undeafened **${undeafened}/${nonBots.size}** members in ${fromChannel.name}`;
}

