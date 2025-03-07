import { building, dev } from '$app/environment';
import * as publicEnv from '$env/static/public';

/**
 * **DO NOT use this directly, instead import `getOptionalEnvVar` from either `private.ts` or `public.ts` in this dir.**
 * Access an optional env var from a given env source.
 * @private
 */
export default function accessOptionalEnvVar(
  env: Record<string, string>,
  varName: string,
  requiredInProd: boolean,
  errorMessageIfMissingInDev?: string | null,
): typeof requiredInProd extends true
  ? typeof dev extends false
    ? string
    : string | undefined
  : string | undefined {
  const varMissing = env[varName] === undefined || env[varName] === '';

  const needProdEnvVars = !(dev || building);

  const surpressMissingVarErrors = publicEnv.PUBLIC_SUPPRESS_MISSING_VAR_IN_PROD_ERRORS === 'true';

  if (needProdEnvVars && requiredInProd && !surpressMissingVarErrors && varMissing) {
    throw new Error(`${varName} env var is required in production! ${{ dev, building }}`);
  } else if (dev && varMissing) {
    const errorMessage = errorMessageIfMissingInDev
      ? `🚨🚨🚨 ${varName} env var is not set. Consequence: ${errorMessageIfMissingInDev}`
      : `🚨🚨🚨 ${varName} env var not provided. Some functionality may not work properly!`;
    // eslint-disable-next-line no-console
    if (errorMessageIfMissingInDev !== null) console.warn(errorMessage);
  }

  return env[varName];
}
