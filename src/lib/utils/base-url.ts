import { browser } from '$app/environment';
import getOptionalEnvVar from './get-optional-env-var/public';

const envBaseUrl = getOptionalEnvVar('PUBLIC_BASE_URL');

export const BASE_URL = browser ? window.location.origin : (envBaseUrl ?? 'http://localhost:5173');
