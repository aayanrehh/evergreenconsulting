// Production build entry (Hostinger runs `npm run build`).
// With TINA_CLIENT_ID + TINA_TOKEN set, builds the /admin editor against TinaCloud first.
// Without them, skips the editor and builds the site alone, so a missing secret never takes the site down.
import { execSync } from 'node:child_process';
import net from 'node:net';

const run = (cmd) => execSync(cmd, { stdio: 'inherit', env: process.env });
const { TINA_CLIENT_ID, TINA_TOKEN } = process.env;

// Find an available TCP port in the given range by attempting to bind.
// Returns the first port that binds successfully, or null if none available.
function findAvailablePort(start, end) {
  return new Promise((resolve) => {
    const tryPort = (port) => {
      if (port > end) {
        resolve(null);
        return;
      }
      const server = net.createServer();
      server.once('error', () => {
        server.close();
        tryPort(port + 1);
      });
      server.once('listening', () => {
        server.close(() => resolve(port));
      });
      server.listen(port, '127.0.0.1');
    };
    tryPort(start);
  });
}

// Run tinacms build with a specific datalayer port.
// Returns { success: true } or { success: false, isPortError: boolean, stderr: string }.
function runTinaBuild(port) {
  const cmd = `npx tinacms build --datalayer-port ${port}`;
  console.log(`tina: attempting build with datalayer port ${port}`);
  try {
    execSync(cmd, { stdio: 'inherit', env: process.env });
    return { success: true };
  } catch (err) {
    const stderr = err.stderr?.toString() || '';
    const stdout = err.stdout?.toString() || '';
    const combined = stderr + stdout;
    // Detect port-collision errors specifically
    const isPortError =
      combined.includes('Datalayer server is busy on port') ||
      combined.includes('EADDRINUSE') ||
      combined.includes('address already in use');
    return { success: false, isPortError, stderr: combined };
  }
}

async function buildTinaWithPortRetry() {
  const MAX_ATTEMPTS = 5;
  const PORT_START = 9100;
  const PORT_END = 9199;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const port = await findAvailablePort(PORT_START, PORT_END);
    if (!port) {
      throw new Error(`tina: no available ports in range ${PORT_START}-${PORT_END}`);
    }

    const result = runTinaBuild(port);
    if (result.success) {
      console.log(`tina: build succeeded on port ${port}`);
      return;
    }

    if (!result.isPortError) {
      // Non-port error (auth, schema, network, etc.) — fail immediately
      console.error(`tina: build failed with non-port error on port ${port}`);
      throw new Error(`tina: build failed: ${result.stderr}`);
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
run('npx astro build');
