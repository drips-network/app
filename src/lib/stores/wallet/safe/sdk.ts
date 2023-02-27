import SafeAppsSDK from '@safe-global/safe-apps-sdk/dist/src/sdk';

/**
 * Get SafeAppsSDK with a fix for `TypeError: SafeAppsSDK is not a constructor`.
 *
 * Taken from https://github.com/wagmi-dev/references/pull/114/files
 */
export default (() => {
  let sdk = SafeAppsSDK;

  if (
    typeof SafeAppsSDK !== 'function' &&
    // @ts-expect-error This import error is not visible to TypeScript
    typeof SafeAppsSDK.default === 'function'
  ) {
    sdk = (SafeAppsSDK as unknown as { default: typeof SafeAppsSDK }).default;
  }

  return sdk;
})();
