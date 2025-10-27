import { promisify } from 'util';
import { readdir, unlink } from 'fs';
import { join } from 'path';

const readdirAsync = promisify(readdir);
const unlinkAsync = promisify(unlink);

async function cleanupTestData() {
  const testDataDir = join(process.cwd(), 'test-data');

  try {
    const files = await readdirAsync(testDataDir);
    const jsonFiles = files.filter((file) => file.endsWith('.json'));

    for (const file of jsonFiles) {
      const filePath = join(testDataDir, file);
      await unlinkAsync(filePath);
    }

    if (jsonFiles.length > 0) {
      // eslint-disable-next-line no-console
      console.log(`Cleaned up ${jsonFiles.length} .json file(s) from test-data directory`);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error cleaning up test data:', error);
  }
}

// Set up signal handlers to cleanup on interruption
let cleanupRegistered = false;

function registerCleanupHandlers() {
  if (cleanupRegistered) return;
  cleanupRegistered = true;

  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGHUP'];

  signals.forEach((signal) => {
    process.on(signal, async () => {
      await cleanupTestData();
      process.exit(0);
    });
  });
}

// Register handlers immediately when this module is loaded
registerCleanupHandlers();

async function globalTeardown() {
  await cleanupTestData();
}

export default globalTeardown;
