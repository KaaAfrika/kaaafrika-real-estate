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

In practice the first deploy hit the middle branch: aaPanel had `kaaafrika`
running bare `npm` in that directory with no `PORT` in its environment, so there
was no port to inherit and it was re-created on `APP_PORT` (3200). Every deploy
since takes the first branch and inherits 3200 — the bootstrap path will not run
again unless the pm2 entry is deleted.

## How it is wired on the VPS

Settled during the first deploy, and worth knowing before touching nginx:

| | |
|---|---|
| pm2 app | `kaaafrika` (the name aaPanel gave it — kept, not renamed) |
| Port | `127.0.0.1:3200` |
| Deploy dir | `/www/wwwroot/life.kaaafrika.com` |
| vhost | `/www/server/panel/vhost/nginx/life.kaaafrika.com.conf` → `proxy_pass http://127.0.0.1:3200;` |

**There are two nginx installations on this box, and only one of them runs.**
The live one is aaPanel's, `/www/server/nginx/sbin/nginx`. A dormant distro
nginx also exists at `/etc/nginx`, and it is the one the `nginx` binary on
`$PATH` reads. That has two consequences:

- **Reload with `/etc/init.d/nginx reload`.** `systemctl reload nginx` reports
  `nginx.service is not active`, and `nginx -s reload` fails with
  `invalid PID number "" in "/run/nginx.pid"` — it is signalling the wrong
  instance, not reporting a real problem.
- **Ignore `nginx -t` warnings about conflicting server names.** The
  `conflicting server name "life.kaaafrika.com" on 0.0.0.0:80, ignored` warning
  comes from duplicate vhosts inside the dormant `/etc/nginx` tree
  (`sites-available/`, `conf.d/00-acme-challenge.conf`). It says nothing about
  what is actually being served.

The upstream port was originally `127.0.0.1:5` — nothing ever listened there,
which is why the site returned 502 long before this pipeline existed.

### pm2 needs node on PATH, and it is not there by default

pm2 lives at `/www/server/nodejs/<version>/bin/pm2` and its launcher begins with
`#!/usr/bin/env node`. aaPanel keeps `node` in that **same** directory, which is
not on root's PATH in a non-interactive SSH session — so a bare

```bash
ssh root@vps /www/server/nodejs/v22.16.0/bin/pm2 list
```

fails with `env: node: No such file or directory` and **exit 127**, which is
indistinguishable from pm2 not being installed. It is installed; it just cannot
find its interpreter. Always prefix the call:

```bash
PATH=/www/server/nodejs/v22.16.0/bin:$PATH pm2 list
```

The workflow does this everywhere, and its probe validates candidates by
running `pm2 -v` under that PATH rather than trusting `-x`.

Note also that the version directory changes when aaPanel updates Node, so the
path is resolved at deploy time rather than hardcoded.

## Why rsync runs with `--force`

Built with pnpm, the standalone bundle carries `node_modules/next`, `react` and
`react-dom` as **relative symlinks** into `node_modules/.pnpm/`. They resolve
inside the bundle, so they are fine to ship — but where the deploy directory
still holds an older npm-style install, those same paths are real, non-empty
directories, and rsync will not replace a directory with a symlink:

```
could not make way for new symlink: node_modules/next
rsync error: some files/attrs were not transferred (code 23)
```

`--force` lets it delete just those in-the-way directories. It is **not**
`--delete`: nothing else in the directory is removed, so `.user.ini` and any
other panel-managed files survive.

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
