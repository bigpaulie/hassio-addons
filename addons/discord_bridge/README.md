# Discord Bridge

Home Assistant add-on that connects to Discord and forwards non-bot messages to a webhook URL.

## Behavior

- Connects to Discord using a bot token (`discord.js`).
- Listens for `messageCreate` events.
- Skips messages from bots.
- If `allowed_channels` is non-empty, only forwards messages from those channel IDs; otherwise forwards from all channels.
- POSTs each message to the configured webhook as JSON:

  ```json
  {
    "content": "<message text>",
    "author": "<Discord username>"
  }
  ```

## Configuration

Options are defined in [`config.yml`](config.yml) and read at runtime from `/data/options.json` (Home Assistant add-on options).

| Option | Type | Description |
|--------|------|-------------|
| `discord_token` | password | Discord bot token |
| `webhook_url` | string | Webhook URL to receive forwarded messages |
| `allowed_channels` | list of strings | Channel IDs to forward; empty list allows all channels |

UI labels are in [`translations/en.yml`](translations/en.yml) and [`translations/ro.yml`](translations/ro.yml).

## Supported architectures

- `amd64`
- `aarch64`

## Development

TypeScript source is in [`src/`](src/). The container image builds with `pnpm` and runs `node dist/main.js` via [`run.sh`](run.sh).

```bash
pnpm install
pnpm run build
```

`pnpm start` runs the compiled entry point locally; it expects `/data/options.json` with the same shape as the add-on options above.

## Files

| File | Role |
|------|------|
| `config.yml` | Add-on metadata and option schema |
| `Dockerfile` | Container build |
| `run.sh` | Container entrypoint |
| `src/main.ts` | Application logic |
