/** Home Assistant add-on options (from `/data/options.json`). */
export interface AddonOptions {
    /** Discord bot token from the Developer Portal. */
    discord_token: string;
    /** Webhook URL (e.g. n8n) that receives forwarded messages. */
    webhook_url: string;
    /** Channel IDs to forward; empty array allows all channels. */
    allowed_channels: string[];
    /** When true, emit verbose logs to the add-on log. */
    debug: boolean;
}