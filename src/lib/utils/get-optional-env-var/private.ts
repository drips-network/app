import * as env from '$env/static/private';

export default function getOptionalEnvVar(name: string): string | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return name in env ? (env as any)[name] : undefined;
}
