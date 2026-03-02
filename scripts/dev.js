import net from 'node:net';
import { spawn } from 'node:child_process';
import process from 'node:process';

const API_PORT_START = 8787;
const API_PORT_END = 8899;

function isPortFree(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const tester = net.createServer();

    tester.once('error', () => {
      resolve(false);
    });

    tester.once('listening', () => {
      tester.close(() => resolve(true));
    });

    tester.listen(port, host);
  });
}

async function findFreePort(start, end) {
  for (let port = start; port <= end; port += 1) {
    if (await isPortFree(port)) return port;
  }
  throw new Error(`No free API port found in range ${start}-${end}.`);
}

async function resolveApiPort() {
  const requested = process.env.API_PORT;
  if (!requested) {
    return findFreePort(API_PORT_START, API_PORT_END);
  }

  const parsed = Number(requested);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    throw new Error(`Invalid API_PORT \"${requested}\". Use a number between 1 and 65535.`);
  }

  if (!(await isPortFree(parsed))) {
    throw new Error(`API_PORT ${parsed} is already in use. Free this port or unset API_PORT.`);
  }

  return parsed;
}

function runDev(apiPort) {
  const child = spawn('npm run dev:raw', {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      API_PORT: String(apiPort)
    }
  });

  const forwardSignal = (signal) => {
    if (!child.killed) {
      child.kill(signal);
    }
  };

  for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
    process.on(signal, () => forwardSignal(signal));
  }

  child.on('exit', (code) => {
    process.exit(code ?? 0);
  });

  child.on('error', (err) => {
    console.error(`[dev] ${err.message}`);
    process.exit(1);
  });
}

try {
  const apiPort = await resolveApiPort();
  console.log(`[dev] Using API_PORT=${apiPort}`);
  runDev(apiPort);
} catch (err) {
  const message = err instanceof Error ? err.message : 'Failed to start dev launcher.';
  console.error(`[dev] ${message}`);
  process.exit(1);
}
