# Continuous deployment (GitHub → VPS)

Every push to `main` builds the app and ships it to the Hostinger VPS — the same
pipeline KaaOps uses, on the same box. The workflow is
[.github/workflows/deploy.yml](../.github/workflows/deploy.yml).

## What runs

1. Build the Next.js **standalone** bundle (`output: 'standalone'` in `next.config.mjs`).
2. Assemble it — copy `public/` and `.next/static` beside `server.js`, since
   standalone omits both.
3. `rsync` it to the VPS app directory over SSH.
4. Restart the pm2 app whose working directory **is** that directory, then curl
   it on the box to confirm it came back up.

The **build always runs**; the **deploy step only runs once the `VPS_*` secrets
are set**, so pushes are green while you finish configuring access.

## Secrets to add

**Settings → Secrets and variables → Actions → New repository secret**, on
`github.com/KaaAfrika/kaaafrika-real-estate`:

| Secret | What | Example |
|---|---|---|
| `VPS_HOST` | VPS IP or hostname | `45.93.138.113` |
| `VPS_USER` | SSH user | the aaPanel/SSH user |
| `VPS_SSH_KEY` | **private** SSH key (full contents) with access to that user | `-----BEGIN OPENSSH PRIVATE KEY-----…` |
| `VPS_PORT` | SSH port (optional, default 22) | `22` |
| `VPS_APP_PATH` | Absolute path of the directory the app is served from | `/www/wwwroot/life.kaaafrika.com` |

There are no build-time secrets: the API base URL is currently hardcoded in
[services/Interceptor.ts](../services/Interceptor.ts). The workflow passes a
`NEXT_PUBLIC_API_URL` repo **Variable** through to the build for when that code
starts reading it — it is public config that ships in the client bundle anyway,
so it is a Variable, not a Secret.

### SSH key

You can reuse the KaaOps deploy key if it is the same user, or make a separate
one on the VPS (as the SSH user):

```bash
ssh-keygen -t ed25519 -f ~/.ssh/kaaestate_deploy -N ""
cat ~/.ssh/kaaestate_deploy.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/kaaestate_deploy   # paste this whole thing into VPS_SSH_KEY
```

## How the restart picks its target

The box runs more than one Node app, so the workflow never restarts pm2 apps
wholesale. It reads `pm2 jlist` and acts only on the app whose working directory
equals `VPS_APP_PATH`:

- **Runs `server.js` there** → plain `pm2 restart`, keeping its existing port.
- **Runs something else there** (typically an aaPanel project started as
  `next start`, which cannot serve a standalone bundle) → that entry is deleted
  and re-created against `server.js`, **reusing the port it already had** so the
  nginx proxy in front of it keeps working.
- **Nothing there** → bootstraps a new app named `kaaafrika-real-estate` on port
  `3200` (KaaOps holds `3100`). Point the site's nginx proxy at `127.0.0.1:3200`.

`APP_NAME` and `APP_PORT` at the top of the workflow control that last case.

## Match the port nginx proxies to

`life.kaaafrika.com` currently returns **502** — nginx is up and proxying, but
nothing is listening on the upstream port. Since no pm2 app is running there, the
first deploy takes the bootstrap path and starts on **3200**, which only clears
the 502 if that is the port nginx already points at. Check it on the VPS:

```bash
grep -rn proxy_pass /www/server/panel/vhost/nginx/life.kaaafrika.com.conf
```

Then either set `APP_PORT` in the workflow to the port that appears there, or
change nginx to `proxy_pass http://127.0.0.1:3200;` and `nginx -s reload`. Only
the bootstrap is affected — once the app exists in pm2, later deploys reuse
whatever port it is already on.

## First deploy

`VPS_APP_PATH` should be a directory that holds **only** this app's standalone
bundle. If you aim it at an existing aaPanel site directory that still contains
the old full checkout (`app/`, `node_modules/`, a previous `.next/`), the rsync
merges into it rather than replacing it — the app will run, but stale files stay
around. Clearing that directory first (keeping aaPanel's `.user.ini`) avoids the
mixed state. `rsync` runs without `--delete` deliberately, so a deploy never
removes panel-managed files it did not put there.

## Rollback

The pipeline overwrites in place, so rollback is re-running an older commit:
**Actions → Deploy to VPS → Run workflow**, or revert the commit and push.
