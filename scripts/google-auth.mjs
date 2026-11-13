// One-time helper: get a Google refresh token so the booking API can read your
// free/busy times and create events on your calendar.
//
// Usage:
//   GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... node scripts/google-auth.mjs
//
// Then copy the printed GOOGLE_REFRESH_TOKEN into your Vercel project's
// environment variables. Run this on your own computer, not on a server.
import http from 'node:http';
import { randomBytes } from 'node:crypto';

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
if (!clientId || !clientSecret) {
  console.error('Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET first (from a "Desktop app" OAuth client).');
  process.exit(1);
}

const PORT = 53682;
const redirectUri = `http://127.0.0.1:${PORT}/callback`;
const state = randomBytes(16).toString('hex');
const scopes = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.freebusy',
];

const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
  client_id: clientId,
  redirect_uri: redirectUri,
  response_type: 'code',
  scope: scopes.join(' '),
  access_type: 'offline',
  prompt: 'consent', // always return a refresh token
  state,
});

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', redirectUri);
  if (url.pathname !== '/callback') { res.writeHead(404).end(); return; }
  if (url.searchParams.get('state') !== state) { res.writeHead(400).end('State mismatch.'); return; }
  const code = url.searchParams.get('code');
  if (!code) { res.writeHead(400).end(`Error: ${url.searchParams.get('error')}`); return; }

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code, client_id: clientId, client_secret: clientSecret,
      redirect_uri: redirectUri, grant_type: 'authorization_code',
    }),
  });
  const tokens = await tokenRes.json();
  if (!tokens.refresh_token) {
    res.writeHead(500).end('No refresh token returned. See the terminal.');
    console.error('Google did not return a refresh token:', tokens);
  } else {
    res.writeHead(200, { 'content-type': 'text/plain' }).end('Done. You can close this tab and go back to the terminal.');
    console.log('\nAdd this to your Vercel environment variables:\n');
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`);
  }
  server.close();
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('Open this URL in your browser and sign in with the Google account whose calendar should take bookings:\n');
  console.log(authUrl + '\n');
});
