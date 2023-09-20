import { derived, writable, get } from 'svelte/store';
import assert from '$lib/utils/assert';
import deduplicateReadable from '../deduplicate-readable';
import { z } from 'zod';
import { formatUnits } from 'ethers/lib/utils';
import { utils } from 'ethers';

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
type Prices = {
  [tokenAddress: TokenAddress]: number | Unsupported | Pending;
};

const prices = writable<Prices>({});

let idMap: { [tokenAddress: TokenAddress]: DataProviderTokenId } | undefined = undefined;

const started = writable(false);

/** Establish a connection to the data provider. */
export async function start() {
  const idMapRes = await (await fetch('/api/fiat-estimates/id-map')).json();

  idMap = z.record(z.string(), z.number()).parse(idMapRes);

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
    assert(utils.isAddress(address), `Invalid address: ${address}`);
  });

  // If we're already tracking any of the given addresses, remove them from the list.
  addresses = addresses.filter(
    (address) => !Object.keys(pricesValue).includes(utils.getAddress(address)),
  );

  // Make all the addresses lowercase
  addresses = addresses.map((address) => address.toLowerCase());

  // If the list is empty, we're done.
  if (addresses.length === 0) return;

  // Update all the tracked addresses to have a price of `pending`.
  addresses.forEach((address) => {
    prices.set({
      ...pricesValue,
      [utils.getAddress(address)]: 'pending',
    });
  });

  // Ensure all addresses are known to the ID map and build a list of address <> ID pairs.
  // If the address isn't known, assign it an ID of `undefined`.
  const ids: [TokenAddress, DataProviderTokenId | undefined][] = [];
  addresses.forEach((address) => {
    assert(idMap);

    const id: number | undefined = idMap[address];

    ids.push([address, id]);
  });

  // Set the price for all token addresses with unknown IDs to `unsupported`.
  ids.forEach((i) => {
    if (i[1] === undefined) {
      prices.update(($prices) => ({
        ...$prices,
        [utils.getAddress(i[0])]: 'unsupported',
      }));
    }
  });

  const knownIds: [TokenAddress, DataProviderTokenId][] = ids.filter(
    (i): i is [string, number] => i[1] !== undefined,
  );

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
        Object.values(knownIds).map(([address, id]) => [utils.getAddress(address), parsedRes[id]]),
      ),
    };
  });
}

/**
 * Convert the given amount to USD.
 * @param amount The amount to convert.
 * @param tokenDecimals The amount of decimals for the token the amount is in.
 * @returns A float representing the amount in USD, `undefined` if the asset
 * isnʼt currently tracked, `pending` if we're waiting for the data provider to
 * report the price for the first time, or `unsupported` if it can't provide
 * a price for the given asset.
 */
export function convert(amount: Amount, tokenDecimals: number) {
  let { tokenAddress } = amount;
  tokenAddress = utils.getAddress(tokenAddress);

  const price = get(prices)[tokenAddress];

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
  tokenAddresses = tokenAddresses.map((address) => utils.getAddress(address));

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
