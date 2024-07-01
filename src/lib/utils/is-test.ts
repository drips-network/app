import getOptionalEnvVar from './get-optional-env-var/public';

export default function isTest(): boolean {
  return (
    getOptionalEnvVar('PUBLIC_TEST_MODE') === 'true' || import.meta.env.VITE_TEST_MODE === 'true'
  );
}
