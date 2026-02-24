import getOptionalEnvVar from '$lib/utils/get-optional-env-var/private';
import { createGelatoEvmRelayerClient } from '@gelatocloud/gasless';

const GELATO_API_KEY = getOptionalEnvVar(
  'GELATO_API_KEY',
  true,
  "Gasless transactions won't work." +
    "This means that claiming a project won't and collecting funds (on networks supporting gasless TXs and with gasless TXs enabled in settings) won't work.",
);

const relayer = GELATO_API_KEY
  ? createGelatoEvmRelayerClient({
      apiKey: GELATO_API_KEY,
    })
  : null;

export { relayer };
