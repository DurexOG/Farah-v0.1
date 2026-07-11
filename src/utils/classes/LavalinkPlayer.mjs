// Minimal Lavalink + queue helper (no external libs required)
// Notes:
// - This implementation uses Lavalink REST/WebSocket-less HTTP calls to fetch track info.
// - It expects you to provide Lavalink URL and credentials via env.
// - Because the repo currently has no audio system, this file provides the core plumbing
//   and commands will call it.

import { setTimeout as delay } from 'timers/promises';

class LavalinkPlayer {
  constructor(client) {
    this.client = client;
    /** @type {Map<string, any>} */
    this.queue = new Map(); // key: guildId
  }

  static getKey(guildId) {
    return `LavalinkQueue:${guildId}`;
  }

  async getConfig() {
    const { Lavalink, Spotify } = this.client?.config || {};
    // Fallback to process.env (project already uses dotenv in index.js)
    const env = process.env;

    return {
      Lavalink: {
        host: Lavalink?.Host || env.LAVALINK_HOST || 'localhost',
        port: Lavalink?.Port || env.LAVALINK_PORT || '2333',
        password: Lavalink?.Password || env.LAVALINK_PASSWORD || '',
        restVersion: Lavalink?.REST_VERSION || env.LAVALINK_REST_VERSION || 'v4',
      },
      Spotify: {
        enabled: !!(Spotify?.Enabled || env.SPOTIFY_ENABLED),
        clientId: Spotify?.ClientId || env.SPOTIFY_CLIENT_ID || '',
        clientSecret: Spotify?.ClientSecret || env.SPOTIFY_CLIENT_SECRET || '',
        // Spotify auth for node implementations is typically handled by lavalink plugins.
        // We keep these placeholders so you can extend later.
      },
    };
  }

  getTracksQueue(guildId) {
    const key = LavalinkPlayer.getKey(guildId);
    if (!this.queue.has(key)) this.queue.set(key, { tracks: [], connection: null, status: 'idle', nowPlaying: null });
    return this.queue.get(key);
  }

  getLavalinkBaseURL(cfg) {
    return `http://${cfg.Lavalink.host}:${cfg.Lavalink.port}`;
  }

  async request(cfg, path, { method = 'GET', body } = {}) {
    const url = this.getLavalinkBaseURL(cfg) + path;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: cfg.Lavalink.password,
    };

    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Lavalink request failed (${res.status}): ${text}`);
    }

    return res.json();
  }

  async ensureConnected(guild) {
    // Lavalink requires WebSocket session; this repo doesn't currently manage WS.
    // We still implement a lightweight “enqueue + send player update” skeleton.
    // If you already run another lib (lavalink-client), you can replace this.
    // For now we just mark connected.
    const queue = this.getTracksQueue(guild.id);
    if (queue.connection) return queue.connection;

    queue.connection = { guildId: guild.id, connected: true };
    return queue.connection;
  }

  async decodeAndLoadTrack(guildId, identifier) {
    const cfg = await this.getConfig();

    // Lavalink REST loadtracks endpoint (standard): /v4/loadtracks?identifier=...
    // Depending on Lavalink version/plugin, query differs.
    const encoded = encodeURIComponent(identifier);
    const path = `/${cfg.Lavalink.restVersion}/loadtracks?identifier=${encoded}`;

    const res = await this.request(cfg, path);

    // Typical response: { loadType, tracks: [...] }
    return res;
  }

  async play(guild, identifier, requester) {
    await this.ensureConnected(guild);

    const queue = this.getTracksQueue(guild.id);
    const loaded = await this.decodeAndLoadTrack(guild.id, identifier);

    if (!loaded?.tracks?.length) {
      return { ok: false, message: 'No tracks found for that input.' };
    }

    // Add tracks to queue
    const tracks = loaded.tracks;
    tracks.forEach((t) => queue.tracks.push(t));

    // If idle, start
    if (queue.status === 'idle' || !queue.nowPlaying) {
      return await this._startNext(guild, requester);
    }

    return { ok: true, message: `Added to queue: ${tracks[0].info?.title || tracks[0].title || 'track'}` };
  }

  async _startNext(guild, requester) {
    const queue = this.getTracksQueue(guild.id);
    const next = queue.tracks.shift();
    if (!next) {
      queue.status = 'idle';
      queue.nowPlaying = null;
      return { ok: true, message: 'Queue ended.' };
    }

    queue.nowPlaying = next;
    queue.status = 'playing';

    // Lavalink: player endpoint via REST is not standard in v4; usually needs WS.
    // Here we provide a placeholder for integration.
    // You should connect Lavalink via websocket elsewhere and call onTrackStart.

    // Placeholder: wait a tick and return.
    await delay(250);

    const title = next.info?.title || next.title;
    return {
      ok: true,
      message: `Now playing: ${title}`,
      nowPlaying: next,
      requester,
    };
  }

  async pause(guild) {
    const queue = this.getTracksQueue(guild.id);
    if (!queue.nowPlaying) return { ok: false, message: 'Nothing is playing.' };
    queue.status = 'paused';
    return { ok: true, message: 'Paused.' };
  }

  async resume(guild) {
    const queue = this.getTracksQueue(guild.id);
    if (!queue.nowPlaying) return { ok: false, message: 'Nothing is paused.' };
    queue.status = 'playing';
    return { ok: true, message: 'Resumed.' };
  }

  async stop(guild) {
    const queue = this.getTracksQueue(guild.id);
    queue.tracks = [];
    queue.nowPlaying = null;
    queue.status = 'idle';
    return { ok: true, message: 'Stopped and cleared queue.' };
  }

  async skip(guild, requester) {
    // remove current and start next
    const queue = this.getTracksQueue(guild.id);
    queue.nowPlaying = null;
    queue.status = 'idle';
    return await this._startNext(guild, requester);
  }

  async getQueueView(guildId, limit = 10) {
    const queue = this.getTracksQueue(guildId);
    const now = queue.nowPlaying;
    const items = queue.tracks.slice(0, limit).map((t, idx) => {
      const title = t.info?.title || t.title || 'track';
      const author = t.info?.author || t.author || '';
      return `${idx + 1}. ${title}${author ? ` — ${author}` : ''}`;
    });

    return {
      nowPlaying: now ? (now.info?.title || now.title) : null,
      status: queue.status,
      tracks: items,
      total: queue.tracks.length,
    };
  }

  // --- Optional Lavalink features (plugin-dependent) ---
  async setVolume(guild, level) {
    // Many Lavalink setups require a player update WS call.
    // Since this wrapper is a REST-only skeleton, return a helpful message.
    const queue = this.getTracksQueue(guild.id);
    queue.volume = level;
    return { ok: true, message: `Volume set to ${level} (stored locally; configure WS/plugin for real effect).` };
  }
}

export default LavalinkPlayer;


