# Personal site — Consulting · Fintech · Implementation

Dark, minimal portfolio + services site built with [Astro](https://astro.build) and Tailwind CSS v4. Static output, no backend.

## Run locally

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # builds for Vercel
npm test         # booking slot logic tests
```

Without Google credentials the booking page runs in **demo mode** (sample times, nothing is booked), so `npm run dev` works out of the box.

## Where to edit content

| What | File |
| --- | --- |
| Name, headline, tagline, email, LinkedIn, photo | `src/site.config.ts` |
| Booking rules (hours, buffer, notice, daily cap, meeting text) | `src/booking.config.ts` |
| Services (3) | `src/content/services/*.md` |
| Packages (scope, duration, price) | `src/content/packages.json` |
| Platforms delivered | `src/content/platforms.json` |
| Case studies | `src/content/case-studies/*.md` (add a file → new page) |
| Testimonials (section hidden while empty) | `src/content/testimonials.json` |
| Career timeline | `src/content/timeline.json` |
| Home proof strip and stats | `src/pages/index.astro` |
| About bio, education, FAQ | `src/pages/about.astro` |
| Colors & type | `src/styles/global.css` (`@theme` block) |
| Domain (sitemap/canonical) | `astro.config.mjs` → `site`, and `public/robots.txt` |
| Social preview / favicon | `public/og.png`, `public/favicon.svg` |

Search the repo for `TODO` to find every placeholder.

## Deploy (Vercel or Netlify)

1. Push this repo to GitHub.
2. In Vercel or Netlify, **Import project** → pick the repo. Framework is auto-detected as Astro (build `npm run build`, output `dist`).
3. Add your custom domain in the host's dashboard, then set `site` in `astro.config.mjs` to that domain.

Every push to the main branch redeploys automatically.

## Set up booking (Google Calendar)

The `/book` page is a built-in scheduler. It reads your free/busy times from Google Calendar, shows open 30-minute slots in the visitor's time zone, and creates the event with a Google Meet link. Google then emails the invite to the visitor. Bookings live only in your calendar; there is no database.

1. **Create OAuth credentials.** In [Google Cloud Console](https://console.cloud.google.com/), create a project and enable the **Google Calendar API**. Then:
   - Under **OAuth consent screen**, choose External, add yourself as a test user, then **Publish app** (set it to "In production"). While the app is in "Testing", refresh tokens expire after 7 days. For your own account an unverified app is fine: you click through one warning.
   - Under **Credentials → Create credentials → OAuth client ID**, choose type **Desktop app**. Copy the client ID and secret.
2. **Get a refresh token** on your own computer:
   ```bash
   GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... node scripts/google-auth.mjs
   ```
   Open the printed link, sign in with the calendar's Google account, and copy the `GOOGLE_REFRESH_TOKEN` it prints.
3. **Add environment variables in Vercel** (Project → Settings → Environment Variables):

   | Name | Value |
   | --- | --- |
   | `GOOGLE_CLIENT_ID` | from step 1 |
   | `GOOGLE_CLIENT_SECRET` | from step 1 |
   | `GOOGLE_REFRESH_TOKEN` | from step 2 |
   | `GOOGLE_CALENDAR_ID` | optional, defaults to `primary` |
   | `BUSY_CALENDAR_IDS` | optional, comma-separated extra calendars that should also block time |

4. **Redeploy.** The demo-mode notice disappears and real bookings go to your calendar.

To cancel or reschedule, use the event in Google Calendar; Google notifies the guest. Rules such as hours, buffers, notice and the daily cap are in `src/booking.config.ts`.
