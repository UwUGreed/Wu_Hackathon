# Scriptable Widget MVP

This repo now includes a lightweight Scriptable widget flow for iPhone.

## What it does

- Uses a dedicated `widgetToken` per user
- Exposes a small widget-safe JSON endpoint at `/widget/summary`
- Lets the dashboard copy a ready-made Scriptable script and widget URL

## Quick setup

1. Open the dashboard in the web app.
2. In the `Scriptable Widget MVP` card, click `Copy Scriptable script`.
3. On your iPhone, open the Scriptable app and create a new script.
4. Paste the copied script.
5. Run it once inside Scriptable to confirm it can reach your backend.
6. Add a medium Scriptable widget to the iPhone home screen.
7. Assign that widget to the saved script.

## Important note for local development

If the copied widget URL uses `localhost` or `127.0.0.1`, the iPhone cannot reach it.

Use one of these instead:

- Open the site from your computer's LAN IP, like `http://192.168.x.x:5173`
- Expose the backend with a tunnel such as ngrok or Cloudflare Tunnel
- Deploy the app/backend to a reachable preview URL

## Widget endpoint

`GET /widget/summary?token=<widgetToken>`

Example response:

```json
{
  "linked": true,
  "displayName": "alex",
  "institution": "Chase",
  "safeToSpendToday": 24.17,
  "risk": "WATCH",
  "mood": "calm",
  "message": "Looking okay. Keep an eye on extras.",
  "updatedAt": "2026-03-28T12:34:56.000Z"
}
```
