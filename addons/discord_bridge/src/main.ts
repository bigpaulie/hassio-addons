import { readFileSync } from 'node:fs';
import { Client, GatewayIntentBits, type Message } from 'discord.js';

/** Home Assistant add-on options (from `/data/options.json`). */
interface AddonOptions {
  /** Discord bot token from the Developer Portal. */
  discord_token: string;
  /** Webhook URL (e.g. n8n) that receives forwarded messages. */
  webhook_url: string;
  /** Channel IDs to forward; empty array allows all channels. */
  allowed_channels: string[];
  /** When true, emit verbose logs to the add-on log. */
  debug: boolean;
}

const config: AddonOptions = JSON.parse(
  readFileSync('/data/options.json', 'utf8')
) as AddonOptions;

const debugEnabled = config.debug === true;

function debugLog(message: string, data?: Record<string, unknown>): void {
  if (!debugEnabled) {
    return;
  }
  if (data === undefined) {
    console.log(`[debug] ${message}`);
    return;
  }
  console.log(`[debug] ${message}`, JSON.stringify(data));
}

debugLog('Starting Discord bridge', {
  allowed_channels: config.allowed_channels.length,
  channel_filter: config.allowed_channels.length > 0 ? 'restricted' : 'all',
  webhook_configured: Boolean(config.webhook_url)
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

if (debugEnabled) {
  client.on('debug', (info) => {
    console.log(`[debug] discord.js: ${info}`);
  });
  client.on('warn', (info) => {
    console.warn(`[debug] discord.js warn: ${info}`);
  });
}

client.on('ready', () => {
  console.log('Discord connected');
  debugLog('Client ready', {
    user: client.user?.tag,
    guilds: client.guilds.cache.size
  });
});

client.on('messageCreate', async (message: Message) => {
  if (message.author.bot) {
    debugLog('Skipped message (bot author)', {
      channel_id: message.channel.id,
      author_id: message.author.id
    });
    return;
  }

  if (
    config.allowed_channels.length &&
    !config.allowed_channels.includes(message.channel.id)
  ) {
    debugLog('Skipped message (channel not allowed)', {
      channel_id: message.channel.id,
      allowed_channels: config.allowed_channels
    });
    return;
  }

  const payload = {
    content: message.content,
    author: message.author.username
  };

  debugLog('Forwarding message to webhook', {
    channel_id: message.channel.id,
    guild_id: message.guild?.id ?? null,
    author: message.author.username,
    content_length: message.content.length
  });

  try {
    const response = await fetch(config.webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(
        `Webhook failed: HTTP ${response.status} ${response.statusText}`,
        body.slice(0, 500)
      );
      debugLog('Webhook error response', {
        status: response.status,
        statusText: response.statusText,
        body_preview: body.slice(0, 200)
      });
      return;
    }

    debugLog('Webhook delivered', { status: response.status });
  } catch (error) {
    const messageText =
      error instanceof Error ? error.message : String(error);
    console.error(`Webhook request failed: ${messageText}`);
    debugLog('Webhook request error', { error: messageText });
  }
});

client.on('error', (error) => {
  console.error('Discord client error:', error.message);
});

client.login(config.discord_token).catch((error: unknown) => {
  const messageText =
    error instanceof Error ? error.message : String(error);
  console.error(`Discord login failed: ${messageText}`);
  process.exit(1);
});
