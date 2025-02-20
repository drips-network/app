import * as env from '$env/static/private';
import accessOptionalEnvVar from './access-optional-env-var';

export default function getOptionalEnvVar(
  name: string,
  requiredInProd: boolean,
  errorMessageIfMissingInDev?: string | null,
): string | undefined {
  if (name.startsWith('PUBLIC_')) {
    throw new Error(
      `getOptionalEnvVar: name must not start with PUBLIC_. Use /access-optional-env-var/public.ts instead.`,
    );
  }

  return accessOptionalEnvVar(env, name, requiredInProd, errorMessageIfMissingInDev);
}
