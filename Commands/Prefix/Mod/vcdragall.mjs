import EmbedBuilder from '../../../src/utils/classes/EmbedBuilder.mjs';
import ModUtils from '../../../src/utils/classes/ModUtils.mjs';

export default {
  ignore: false,
  name: 'vcdragall',
  description: 'drag all members from your voice channel to another voice channel',
  cooldown: 5,
  aliases: ['vc-drag-all', 'dragall'],
  category: 'Moderation',
  permissions: {
    user: ['MoveMembers'],
    bot: ['MoveMembers'],
  },
  options: [
    {
      name: 'Channel',
      id: 'channel',
      required: false,
      type: 'channel',
    },
    {
      name: 'Channel ID',
      id: 'channelId',
      required: false,
      type: 'string',
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
      const targetChannel = options.get('channel');
      const channelId = options.get('channelId');
      const reason = options.get('reason') || 'Not Specified';

      const resolvedTargetChannel =
        targetChannel ||
        (channelId
          ? await message.guild.channels
              .fetch(channelId)
              .catch(() => null)
          : null);

      if (!resolvedTargetChannel || !resolvedTargetChannel.isVoiceBased?.()) {
        return '!{i} Please provide a valid voice channel (channel mention or channel id)';
      }

      const Embed = new EmbedBuilder(client).setTheme(guildData.Theme);

      const msg = await message.safeReply({
        embeds: [Embed.setDescription('^{common.loading}')],
      });

      const response = await vcdragall(message.member, resolvedTargetChannel, reason);


      await msg.safeEdit({
        embeds: [Embed.setDescription(response)],
      });
    } catch (error) {
      err(error);
    }
  },
};

async function vcdragall(issuer, targetChannel, reason) {
  const fromChannel = issuer.voice?.channel;
  if (!fromChannel) return '!{i} You are not in a voice channel';

  if (!targetChannel || !targetChannel.isVoiceBased?.()) {
    return '!{i} Please provide a valid voice channel';
  }

  const members = fromChannel.members;
  const nonBots = members.filter((m) => !m.user.bot);

  if (nonBots.size === 0) return '!{i} No non-bot members to drag';

  let moved = 0;
  for (const member of nonBots.values()) {
    // If dragging fails for any reason, try to "nudge" the user with poke twice.
    const res = await ModUtils.moveTarget(issuer, member, reason, targetChannel).catch(() => null);
    if (res === true || typeof res === 'boolean') {
      moved++;
      continue;
    }

    try {
      // Lazy-load poke module to avoid circular deps.
      const pokeMod = await import('./poke.mjs');
      const pokeFn = pokeMod?.default?._poke || pokeMod?.default?.poke || pokeMod?.poke;

      // poke.mjs does not export helper directly; fall back to doing the equivalent DM.
      if (typeof pokeFn === 'function') {
        await pokeFn(issuer, member, 'hey!').catch(() => {});
        await pokeFn(issuer, member, 'hey!').catch(() => {});
      } else {
        await member
          .send({ content: `**${issuer.user.username}** poked **${member.user.username}**: hey!` })
          .catch(() => {});
        await member
          .send({ content: `**${issuer.user.username}** poked **${member.user.username}**: hey!` })
          .catch(() => {});
      }
    } catch {
      // ignore poke failures
    }
  }

  return `!{y} Dragged **${moved}/${nonBots.size}** members to ${targetChannel.name}`;
}

