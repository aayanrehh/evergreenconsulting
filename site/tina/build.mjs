// Production build entry (Hostinger runs `npm run build`).
// With TINA_CLIENT_ID + TINA_TOKEN set, builds the /admin editor against TinaCloud first.
// Without them, skips the editor and builds the site alone, so a missing secret never takes the site down.
import { execSync } from 'node:child_process';

const run = (cmd) => execSync(cmd, { stdio: 'inherit', env: process.env });
const { TINA_CLIENT_ID, TINA_TOKEN } = process.env;

if (TINA_CLIENT_ID && TINA_TOKEN) {
  console.log('tina: building /admin against TinaCloud');
  run('npx tinacms build');
} else {
  console.warn('tina: TINA_CLIENT_ID / TINA_TOKEN not set, skipping /admin build');
}
run('npx astro build');
