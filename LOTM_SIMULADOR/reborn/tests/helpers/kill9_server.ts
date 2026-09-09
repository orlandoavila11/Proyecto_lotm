import { buildApp } from '../../src/server/app.js';
import * as fs from 'node:fs';

const dbPath = process.env.TEST_DB_PATH;
const readyFile = process.env.TEST_READY_FILE;

if (!dbPath || !readyFile) {
  console.error('TEST_DB_PATH y TEST_READY_FILE son requeridos');
  process.exit(1);
}

async function main() {
  const { app } = await buildApp({ dbPath });
  const address = await app.listen({ port: 0, host: '127.0.0.1' });
  const port = (app.server.address() as any).port;

  const info = {
    pid: process.pid,
    port,
    address
  };

  fs.writeFileSync(readyFile, JSON.stringify(info), 'utf-8');
  console.log(`[KILL9_SERVER_READY] PID=${process.pid} PORT=${port}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
