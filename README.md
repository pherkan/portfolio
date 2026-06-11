
## Local Iftar Arcade setup

1. Create `.env.local` in project root:
   - `SECRET_CODE_IFTAR=your_6_digit_code`
   - `RESEND_API_KEY=your_resend_api_key`
2. Start local dev with Netlify Functions enabled:
   - `npm run dev:netlify`
3. Open `http://localhost:8888/iftar2026/` and test secret code validation.

`npm start` runs Eleventy only. For secret-code verification and signup notification functions, use `npm run dev:netlify`.

## VPS / Coolify setup

The site can run outside Netlify with the included Dockerfile:

1. Build the static Eleventy site during the image build.
2. Serve `_site` with `server.cjs` on `PORT=3000`.
3. Keep the existing `/.netlify/functions/*` Iftar endpoints working.
4. Send contact form messages through Resend.

Set the environment variables from `env.example` in Coolify before switching DNS.


## Credit
*This project was originally forked from [eleventy-netlify-boilerplate](https://github.com/danurbanowicz/eleventy-netlify-boilerplate), but completely revamped to match the needs of a modern porfolio.*
