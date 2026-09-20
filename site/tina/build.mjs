// Production build entry (Hostinger runs `npm run build`).
// With TINA_CLIENT_ID + TINA_TOKEN set, builds the /admin editor against TinaCloud first.
// Without them, skips the editor and builds the site alone, so a missing secret never takes the site down.
import { spawnSync } from 'node:child_process';

const { TINA_CLIENT_ID, TINA_TOKEN } = process.env;

// Run tinacms build with a specific datalayer port.
// Captures stdout/stderr while also emitting them to the build log.
// Returns { success: true } or { success: false, isPortError: boolean, output: string }.
function runTinaBuild(port) {
  const cmd = 'npx';
  const args = ['tinacms', 'build', '--datalayer-port', String(port)];
  console.log(`tina: attempting build with datalayer port ${port}`);

  const result = spawnSync(cmd, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: process.env,
  });

  // Handle spawn-level errors (e.g., binary not found, permission denied)
  if (result.error) {
    const errMsg = `tina: failed to spawn process: ${result.error.message}`;
    console.error(errMsg);
    return { success: false, isPortError: false, output: errMsg };
  }

  // Emit captured output to the build log for debugging
  if (result.stdout && result.stdout.length > 0) {
    process.stdout.write(result.stdout);
  }
  if (result.stderr && result.stderr.length > 0) {
    process.stderr.write(result.stderr);
  }

  if (result.status === 0) {
    return { success: true };
  }

  const output = (result.stdout?.toString() || '') + (result.stderr?.toString() || '');

  // Detect port-collision errors specifically
  const isPortError =
    output.includes('Datalayer server is busy on port') ||
    output.includes('EADDRINUSE') ||
    output.includes('address already in use');

  return { success: false, isPortError, output };
}

async function buildTinaWithPortRetry() {
  const MAX_ATTEMPTS = 5;
  const PORT_START = 9100;
  const PORT_END = 9199;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    // Use Tina itself as the authoritative port-availability test.
    // Each attempt uses a distinct port; a collision on one port advances to the next.
    const port = PORT_START + attempt - 1;
    if (port > PORT_END) {
      throw new Error(`tina: exhausted port range ${PORT_START}-${PORT_END}`);
    }

    const result = runTinaBuild(port);
    if (result.success) {
      console.log(`tina: build succeeded on port ${port}`);
      return;
    }

    if (!result.isPortError) {
      // Non-port error (auth, schema, network, etc.) — fail immediately
      console.error(`tina: build failed with non-port error on port ${port}`);
      throw new Error(`tina: build failed: ${result.output}`);
    }

    console.warn(`tina: port ${port} is occupied, retrying (attempt ${attempt}/${MAX_ATTEMPTS})`);
  }

  throw new Error(`tina: exhausted ${MAX_ATTEMPTS} port attempts in range ${PORT_START}-${PORT_END}`);
}

if (TINA_CLIENT_ID && TINA_TOKEN) {
  console.log('tina: building /admin against TinaCloud');
  await buildTinaWithPortRetry();
} else {
  console.warn('tina: TINA_CLIENT_ID / TINA_TOKEN not set, skipping /admin build');
}

// Run astro build (inherit stdio for normal output)
const astroResult = spawnSync('npx', ['astro', 'build'], {
  stdio: 'inherit',
  env: process.env,
});
if (astroResult.error) {
  console.error(`astro: failed to spawn process: ${astroResult.error.message}`);
  process.exit(1);
}
if (astroResult.status !== 0) {
  // Use a non-zero fallback if status is null (spawn-level failure)
  process.exit(astroResult.status ?? 1);
}
