import { browser } from '$app/environment';
import getOptionalEnvVar from './get-optional-env-var/public';
import stripTrailingSlash from './strip-trailing-slash';

const envBaseUrl = getOptionalEnvVar('PUBLIC_BASE_URL', true, null);

export const BASE_URL = browser
  ? window.location.origin
  : envBaseUrl
    ? stripTrailingSlash(envBaseUrl)
    : 'http://localhost:5173';
