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
}

const config: AddonOptions = JSON.parse(
  readFileSync('/data/options.json', 'utf8')
) as AddonOptions;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on('ready', () => {
  console.log('Discord connected');
});

client.on('messageCreate', async (message: Message) => {
  if (message.author.bot) {
    return;
  }

  if (
    config.allowed_channels.length &&
    !config.allowed_channels.includes(message.channel.id)
  ) {
    return;
  }

  await fetch(config.webhook_url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      content: message.content,
      author: message.author.username
    })
  });
});

client.login(config.discord_token);