import { derived, writable, get } from 'svelte/store';
import assert from '$lib/utils/assert';
import deduplicateReadable from '../deduplicate-readable';
import { z } from 'zod';
import { formatUnits, getAddress, isAddress } from 'ethers';

type TokenAddress = string;
type DataProviderTokenId = number;

interface Amount {
  amount: bigint;
  tokenAddress: TokenAddress;
}

/** Price value is this if the data provider doesnʼt provide a price for the given asset. */
type Unsupported = 'unsupported';

/** Price value is this if we're waiting for the data provider to post a price for the first time. */
type Pending = 'pending';

/** All prices relative to USD */
export type Prices = {
  [tokenAddress: TokenAddress]: number | Unsupported | Pending;
};

const prices = writable<Prices>({});

let idMap: { [tokenAddress: TokenAddress]: DataProviderTokenId } | undefined = undefined;

const started = writable(false);

const SUBSTITUTIONS: Record<string, string> = {
  // Map "WEENUS" testnet token to WETH mainnet
  ['0x7439E9Bb6D8a84dd3A23fe621A30F95403F87fB9']: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  // Map "XEENUS" testnet token to WETH mainnet
  ['0xc21d97673B9E0B3AA53a06439F71fDc1facE393B']: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  // Map WETH sepolia token to WETH mainnet
  ['0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9']: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
};

/**
 * For alt L1/L2 tokens that don't have an equivalent value token on Eth Mainnet.
 * Keys are token contract addresses on the L1/L2, values are coinmarket cap unique asset IDs to map to.
 * */
const MANUAL_IDS: Record<string, string> = {
  /* Map Wrapped Filecoin to Filecoin */
  '0x60E1773636CF5E4A227d9AC24F20fEca034ee25A': '2280',
  /* Map METIS to METIS */
  '0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000': '9640',
};

/** Establish a connection to the data provider. */
export async function start() {
  const idMapRes = await (await fetch('/api/fiat-estimates/id-map')).json();

  idMap = z.record(z.string(), z.number()).parse(idMapRes);

  // Apply substitutions
  Object.entries(SUBSTITUTIONS).forEach(([key, value]) => {
    assert(idMap);
    idMap[key] = idMap[value];
  });

  started.set(true);

  return;
}

/** Start tracking the provided addresses. */
export async function track(addresses: TokenAddress[]) {
  assert(
    idMap,
    'Store not started, ensure `start` is called and wait for `started` to be true first.',
  );

  const pricesValue = get(prices);

  // Validate all the addresses are valid ETH addresses
  addresses.forEach((address) => {
    assert(isAddress(address), `Invalid address: ${address}`);
  });

  // If we're already tracking any of the given addresses, remove them from the list.
  addresses = addresses.filter(
    (address) => !Object.keys(pricesValue).includes(getAddress(address)),
  );

  // Make all the addresses lowercase
  addresses = addresses.map((address) => address.toLowerCase());

  // If the list is empty, we're done.
  if (addresses.length === 0) return;

  // Update all the tracked addresses to have a price of `pending`.
  addresses.forEach((address) => {
    prices.set({
      ...pricesValue,
      [getAddress(address)]: 'pending',
    });
  });

  // Ensure all addresses are known to the ID map and build a list of address <> ID pairs.
  // If the address isn't known, assign it an ID of `undefined`.
  const ids: [TokenAddress, DataProviderTokenId | undefined][] = [];
  addresses.forEach((address) => {
    assert(idMap);

    const id: number | undefined =
      idMap[address] ??
      Object.entries(MANUAL_IDS).find(([a]) => a.toLowerCase() === address.toLowerCase())?.[1];

    ids.push([address, id]);
  });

  // Set the price for all token addresses with unknown IDs to `unsupported`.
  ids.forEach((i) => {
    if (i[1] === undefined) {
      prices.update(($prices) => ({
        ...$prices,
        [getAddress(i[0])]: 'unsupported',
      }));
    }
  });

  const knownIds: [TokenAddress, DataProviderTokenId][] = ids.filter(
    (i): i is [string, number] => i[1] !== undefined,
  );

  // If knownIds is empty, we're done.
  if (knownIds.length === 0) return;

  // Build a string of all known IDs
  const idString = knownIds.map((i) => i[1]).join(',');

  // Request the current prices for all tracked assets from /api/fiat-estimates/price/tokenId1,tokenId2,...
  const priceRes = await fetch(`/api/fiat-estimates/price/${idString}`);

  const parsedRes = z.record(z.string(), z.number()).parse(await priceRes.json());

  // Update the prices store with the new prices
  prices.update(($prices) => {
    return {
      ...$prices,
      ...Object.fromEntries(
        Object.values(knownIds).map(([address, id]) => [getAddress(address), parsedRes[id]]),
      ),
    };
  });
}

/**
 * Convert the given amount to USD.
 * @param amount The amount to convert.
 * @param tokenDecimals The amount of decimals for the token the amount is in.
 * @param prices The prices to source from.
 * @returns A float representing the amount in USD, `undefined` if the asset
 * isnʼt currently tracked, `pending` if we're waiting for the data provider to
 * report the price for the first time, or `unsupported` if it can't provide
 * a price for the given asset.
 */
export function convert(amount: Amount, tokenDecimals: number, prices: Prices) {
  let { tokenAddress } = amount;
  tokenAddress = getAddress(tokenAddress);

  const price = prices[tokenAddress];

  if (!price) return undefined;
  if (typeof price === 'string') return price;

  const tokenAmount = parseFloat(formatUnits(amount.amount, tokenDecimals));

  return tokenAmount * price;
}

/**
 * Create a deduplicated readable that notifies whenever the price for any of the given
 * tokenAddresses changes.
 * @param tokenAddresses The tokens to subscribe to.
 */
const price = (tokenAddresses: TokenAddress[]) => {
  tokenAddresses = tokenAddresses.map((address) => getAddress(address));

  return deduplicateReadable(
    derived(prices, ($prices) => {
      // Return an object of all the prices for the given symbols.
      return Object.fromEntries(
        tokenAddresses.map((tokenAddress) => [tokenAddress, $prices[tokenAddress] || 'pending']),
      );
    }),
  );
};

export default {
  start,
  started: { subscribe: started.subscribe },
  track,
  price,
  convert,
};
