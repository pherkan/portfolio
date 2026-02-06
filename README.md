
## Local Iftar Arcade setup

1. Create `.env.local` in project root:
   - `SECRET_CODE_IFTAR=your_6_digit_code`
   - `RESEND_API_KEY=your_resend_api_key`
2. Start local dev with Netlify Functions enabled:
   - `npm run dev:netlify`
3. Open `http://localhost:8888/iftar2026/` and test secret code validation.

`npm start` runs Eleventy only. For secret-code verification and signup notification functions, use `npm run dev:netlify`.


## Credit
*This project was originally forked from [eleventy-netlify-boilerplate](https://github.com/danurbanowicz/eleventy-netlify-boilerplate), but completely revamped to match the needs of a modern porfolio.*
