# Portfolio Deployment

## Current Production Host

The portfolio runs on the Hetzner VPS through Coolify.

- Public site: `https://pherkan.com/`
- Coolify admin/API: `https://coolify.pherkan.com/`
- Health endpoint: `/health`
- Local deploy helper: `/Users/pherkan/digital_projects/deploy/coolify-deploy.mjs`

## Production Rule

A production deploy is not complete when code is pushed, and it is not complete when Coolify starts building. It is complete only when:

1. Coolify reports the deployment as `finished`.
2. The real public site `https://pherkan.com/` returns a healthy response.

## Standard Flow

```bash
npm run build
git status --short
# commit and push the intended release changes
node /Users/pherkan/digital_projects/deploy/coolify-deploy.mjs
```

The helper loads shared credentials from:

```text
~/.config/pherkan-deploy/coolify.env
```

and project-specific deployment values from this repo's ignored `.env.local`.

## How The Security Layers Fit Together

- Cloudflare Access is the security gate in front of `coolify.pherkan.com`.
- Cloudflare Service Auth lets trusted automation through that gate with a service token.
- The Coolify API token lets the automation trigger and inspect deployments inside Coolify.
- NetBird is a private maintenance route to the VPS; it is not required for normal Coolify deploys.

