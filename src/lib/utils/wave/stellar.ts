import * as StellarSdk from '@stellar/stellar-sdk';

// USDC on Stellar Mainnet
const USDC_ASSET_CODE = 'USDC';
const USDC_ISSUER = 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN';

const HORIZON_URL = 'https://horizon.stellar.org';

export interface TrustlineCheckResult {
  exists: boolean;
  isAuthorized: boolean;
  hasCapacity: boolean;
  availableLimit: number | null;
  error: string | null;
}

/**
 * Verifies if a Stellar account has a USDC trustline and is ready to receive USDC.
 * @param accountId The Stellar public key (starts with G)
 * @returns TrustlineCheckResult with details about the trustline status
 */
export async function verifyUsdcTrustline(accountId: string): Promise<TrustlineCheckResult> {
  const server = new StellarSdk.Horizon.Server(HORIZON_URL);

  try {
    const account = await server.loadAccount(accountId);

    // Find USDC balance in account balances
    const usdcBalance = account.balances.find(
      (balance): balance is StellarSdk.Horizon.HorizonApi.BalanceLineAsset =>
        balance.asset_type === 'credit_alphanum4' &&
        'asset_code' in balance &&
        'asset_issuer' in balance &&
        balance.asset_code === USDC_ASSET_CODE &&
        balance.asset_issuer === USDC_ISSUER,
    );

    if (!usdcBalance) {
      return {
        exists: false,
        isAuthorized: false,
        hasCapacity: false,
        availableLimit: null,
        error: 'USDC trustline not found. Please enable the USDC trustline in your wallet.',
      };
    }

    // Check if trustline is authorized
    const isAuthorized = usdcBalance.is_authorized === true;

    if (!isAuthorized) {
      return {
        exists: true,
        isAuthorized: false,
        hasCapacity: false,
        availableLimit: null,
        error: 'USDC trustline exists but is not authorized.',
      };
    }

    // Calculate available limit
    const limit = parseFloat(usdcBalance.limit);
    const currentBalance = parseFloat(usdcBalance.balance);
    const availableLimit = limit - currentBalance;

    return {
      exists: true,
      isAuthorized: true,
      hasCapacity: availableLimit > 0,
      availableLimit,
      error: null,
    };
  } catch (err) {
    // Handle account not found error
    if (err instanceof StellarSdk.NotFoundError) {
      return {
        exists: false,
        isAuthorized: false,
        hasCapacity: false,
        availableLimit: null,
        error: 'Stellar account not found. Make sure the account is funded and active.',
      };
    }

    // Handle other errors
    const message = err instanceof Error ? err.message : 'Unknown error verifying trustline';
    return {
      exists: false,
      isAuthorized: false,
      hasCapacity: false,
      availableLimit: null,
      error: message,
    };
  }
}
