import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';

export const BASE_URL = browser
  ? window.location.origin
  : INJECTED_DEPLOY_URL ?? env.PUBLIC_BASE_URL ?? 'http://localhost:5173';
