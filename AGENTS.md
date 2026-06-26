# Repository Guidelines

## Communication Style
- The user is a product manager, not a developer.
- Explain deployment and infrastructure work in clear everyday language first, then name the technical systems involved.
- When production is involved, be explicit about what was changed, what was deployed, and what public URL was verified.

## Production Deployment Rule
This portfolio is deployed with Coolify on the Hetzner VPS. The public site is:

- `https://pherkan.com/`

When the user asks to push or deploy to production, do not stop after a Git push or after triggering Coolify. Production is only done when the actual public website is live and healthy.

Use this flow:

1. Check local Git state and understand any existing changes before editing.
2. Run the relevant local validation, usually `npm run build`.
3. Commit and push the intended release changes.
4. Trigger the Coolify deployment with the shared helper:
   ```bash
   node /Users/pherkan/digital_projects/deploy/coolify-deploy.mjs
   ```
5. Wait for Coolify's deployment status to become `finished`.
6. Verify `https://pherkan.com/` returns a healthy response.
7. Report the commit, deployment result, and public-site health.

## Deployment Credentials
The deploy helper uses shared local credentials from:

```text
/Users/pherkan/.config/pherkan-deploy/coolify.env
```

Do not print, copy, or commit those secrets. The per-project deploy webhook and production URL live in this repo's ignored `.env.local`.

## Infrastructure Map
- Cloudflare Access protects `https://coolify.pherkan.com/`, the Coolify admin/API endpoint.
- Cloudflare Service Auth lets local automation pass that access gate without a browser login.
- Coolify receives the deploy request, builds the Docker image, starts the container, and reports deployment status.
- NetBird is useful for private VPS maintenance/SSH, but the normal production deploy path is the Coolify API over HTTPS.

