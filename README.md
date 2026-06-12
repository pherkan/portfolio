
## VPS / Coolify setup

The site runs on the Hetzner VPS through Coolify with the included Dockerfile:

1. Build the static Eleventy site during the image build.
2. Serve `_site` with `server.cjs` on `PORT=3000`.
3. Expose `/health` for Coolify health checks.

No production email provider or serverless functions are required.


## Credit
*This project started from an Eleventy portfolio template, but has been completely revamped to match the needs of a modern portfolio.*
