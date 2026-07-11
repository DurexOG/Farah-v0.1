import EmbedBuilder from '../../../src/utils/classes/EmbedBuilder.mjs';
/** @type {import("../../../src/utils/Command.mjs").prefix} */

export default {
    name: "prefix",
    cooldown: 5,
    description: "Change Farah's Prefix",
    aliases: [],
    category: "General",
    run: async ({ message, client, err, guildData }) => {
        try {
            const prefix = guildData?.Prefix || client.config.Prefix

            await message.safeReply({
                embeds: [new EmbedBuilder(client).setDescription("^{command.prefix.title}" + prefix)]
            })

        } catch (error) {
            err(error)
        }
    }
};