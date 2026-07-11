// Placeholder Spotify helper.
// Many Lavalink Spotify setups use a Lavalink plugin to handle Spotify track/playlist linking.
// This file is provided so you can extend later if you want to do Spotify API calls from this bot.

export default class Spotify {
  static async resolve(query) {
    // Return input as-is; expected to be handled by Lavalink plugin.
    return query;
  }
}

