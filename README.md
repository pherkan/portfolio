
## VPS / Coolify setup

The site can run outside Netlify with the included Dockerfile:

1. Build the static Eleventy site during the image build.
2. Serve `_site` with `server.cjs` on `PORT=3000`.
3. Expose `/health` for Coolify health checks.

No production email provider or Netlify Functions are required.


## Credit
*This project was originally forked from [eleventy-netlify-boilerplate](https://github.com/danurbanowicz/eleventy-netlify-boilerplate), but completely revamped to match the needs of a modern porfolio.*
