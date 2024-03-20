import { browser } from '$app/environment';

export const BASE_URL = browser
  ? window.location.origin
  : process.env.BASE_URL ?? 'http://localhost:5173';
