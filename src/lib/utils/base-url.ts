import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';

/** INJECTED_DEPLOY_URL is replaced by Vite during build process. */
const deployUrl =
  'INJECTED_DEPLOY_URL'.toString() !== 'undefined' ? 'INJECTED_DEPLOY_URL' : undefined;

export const BASE_URL = browser
  ? window.location.origin
  : deployUrl ?? env.PUBLIC_BASE_URL ?? 'http://localhost:5173';
