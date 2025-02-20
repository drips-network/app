import * as env from '$env/static/public';
import accessOptionalEnvVar from './access-optional-env-var';

export default function getOptionalEnvVar(
  name: string,
  requiredInProd: boolean,
  errorMessageIfMissingInDev?: string | null,
): string | undefined {
  if (!name.startsWith('PUBLIC_')) {
    throw new Error(`getOptionalEnvVar: name must start with PUBLIC_`);
  }

  return accessOptionalEnvVar(env, name, requiredInProd, errorMessageIfMissingInDev);
}
