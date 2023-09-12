import { derived, writable, get } from 'svelte/store';
import assert from '$lib/utils/assert';
import deduplicateReadable from '../deduplicate-readable';
import tokensStore from '$lib/stores/tokens/tokens.store';
import createSocket from './sockets';
import { BinanceCommand, BinanceMessage } from './binance-ws-api/types';
import { SUPPORTED_SYMBOLS, type SupportedSymbol } from './binance-ws-api/supported-symbols';
import type { z } from 'zod';
import { formatUnits } from 'ethers/lib/utils';

interface Amount {
  amount: bigint;
  tokenAddress: string;
}

/** Price value is this if Binance doesnʼt provide a price for the given asset. */
type Unsupported = 'unsupported';

/** Price value is this if we're waiting for Binance to provide a price for the first time. */
type Pending = 'pending';

/** All prices relative to USDT */
type Prices = {
  [symbol: string]: number | Unsupported | Pending;
};

/** Some ERC-20s not directly traded on Binance are pegged to the value of another currency. */
const TOKEN_SUBSTITUTIONS: { [symbol: string]: SupportedSymbol } = {
  WETH: 'ETH',
  WEENUS: 'ETH',
  WBTC: 'BTC',
};

const prices = writable<Prices>({});

function _handleMessage(e: MessageEvent<z.infer<typeof BinanceMessage>>) {
  const { data } = e;

  if ('e' in data && data.e === '24hrTicker') {
    const symbol = data.s.replace('USDT', '');
    const price = parseFloat(data.c);

    prices.update((prices) => ({
      ...prices,
      [symbol]: price,
    }));
  }
}

function _validateSymbol(symbol: string): asserts symbol is SupportedSymbol {
  assert(SUPPORTED_SYMBOLS.includes(symbol as SupportedSymbol), `Unsupported symbol: ${symbol}`);
}

let connection:
  | ReturnType<typeof createSocket<typeof BinanceMessage, typeof BinanceCommand>>
  | undefined;
const socketOpen = writable(false);

/** Establish a websocket connection and allow tracking prices. */
export function start() {
  return new Promise<void>((resolve) => {
    connection = createSocket(
      BinanceMessage,
      BinanceCommand,
      'wss://stream.binance.com:9443/ws/radusdt@ticker',
    );

    const { send, subscribe } = connection;

    /*
    Establishing a socket connection requires subscribing to some random symbol,
    but we immediately unsubscribe on open and resolve the start promise.
    */
    connection.socket.addEventListener(
      'open',
      () => {
        send({
          method: 'UNSUBSCRIBE',
          params: ['radusdt@ticker'],
          id: 1,
        });

        socketOpen.set(true);

        resolve();
      },
      { once: true },
    );

    subscribe(_handleMessage);
  });
}

/** Destroy any previously-started websocket connection. */
export function stop() {
  connection?.destroy();
  socketOpen.set(false);
  connection = undefined;
}

/** Start tracking the provided symbols. */
export async function track(symbols: string[]) {
  assert(connection, 'Socket not initialized');

  // If socketOpen is false, wait for it to open
  if (!get(socketOpen)) {
    await new Promise<void>((resolve) => {
      const unsubscribe = socketOpen.subscribe((open) => {
        if (open) {
          unsubscribe();
          resolve();
        }
      });
    });
  }

  const pv = get(prices);

  symbols = symbols
    .map((symbol) => TOKEN_SUBSTITUTIONS[symbol] || symbol)
    .filter((symbol) => !pv[symbol]);

  // Set values for all unsupported symbols in prices store to unsupported.
  prices.update((prices) => {
    const newPrices: Prices = {};

    for (const symbol of symbols) {
      if (!SUPPORTED_SYMBOLS.includes(symbol as SupportedSymbol)) {
        newPrices[symbol] = 'unsupported';
      }
    }

    return {
      ...prices,
      ...newPrices,
    };
  });

  // Filter out all unsupported symbols.
  symbols = symbols.filter((symbol) => SUPPORTED_SYMBOLS.includes(symbol as SupportedSymbol));

  // Set values for all the supported symbols in prices store to pending.
  prices.update((prices) => {
    const newPrices: Prices = {};

    for (const symbol of symbols) {
      newPrices[symbol] = 'pending';
    }

    return {
      ...prices,
      ...newPrices,
    };
  });

  if (symbols.length === 0) return;

  connection.send({
    method: 'SUBSCRIBE',
    params: symbols.map((symbol) => `${symbol.toLowerCase()}usdt@ticker`),
    id: 1,
  });
}

/** Stop tracking the provided symbols. */
export async function untrack(symbols: string[]) {
  assert(connection, 'Socket not initialized');

  symbols = symbols.map((symbol) => TOKEN_SUBSTITUTIONS[symbol] || symbol);

  connection.send({
    method: 'UNSUBSCRIBE',
    params: symbols.map((symbol) => `${symbol.toLowerCase()}usdt@ticker`),
    id: 1,
  });
}

/**
 * Convert the given amount to USD.
 * @param amount The amount to convert.
 * @returns A float representing the amount in USD, `undefined` if the asset
 * isnʼt currently tracked, `pending` if we're waiting for Binance to report
 * the price for the first time, or `unsupported` if Binance doesnʼt provide
 * a price for the given asset.
 */
export function convert(amount: Amount) {
  const token = tokensStore.getByAddress(amount.tokenAddress);

  if (!token) return 'unsupported';

  let symbol = token.info.symbol;
  symbol = TOKEN_SUBSTITUTIONS[symbol] || symbol;

  try {
    _validateSymbol(symbol);
  } catch {
    return 'unsupported';
  }

  const price = get(prices)[symbol];

  if (!price) return undefined;
  if (typeof price === 'string') return price;

  const tokenAmount = parseFloat(formatUnits(amount.amount, token.info.decimals));

  return tokenAmount * price;
}

/**
 * Create a deduplicated readable that notifies whenever the price for any of the given
 * symbols changes.
 * @param symbols The symbols to subscribe to.
 */
const price = (symbols: string[]) =>
  deduplicateReadable(
    derived(prices, ($prices) => {
      symbols = symbols.map((symbol) => TOKEN_SUBSTITUTIONS[symbol] || symbol);

      // Return an object of all the prices for the given symbols.
      return Object.fromEntries(symbols.map((symbol) => [symbol, $prices[symbol] || 'pending']));
    }),
  );

export default {
  start,
  stop,
  track,
  untrack,
  price,
  convert,
};
