import z from 'zod';

export const Binance24hTickerMessage = z.object({
  e: z.literal('24hrTicker'), // Event type
  E: z.number(), // Event time
  s: z.string(), // Symbol
  p: z.string(), // Price change
  P: z.string(), // Price change percent
  w: z.string(), // Weighted average price
  x: z.string(), // First trade(F)-1 price (first trade before the 24hr rolling window)
  c: z.string(), // Last price
  Q: z.string(), // Last quantity
  b: z.string(), // Best bid price
  B: z.string(), // Best bid quantity
  a: z.string(), // Best ask price
  A: z.string(), // Best ask quantity
  o: z.string(), // Open price
  h: z.string(), // High price
  l: z.string(), // Low price
  v: z.string(), // Total traded base asset volume
  q: z.string(), // Total traded quote asset volume
  O: z.number(), // Statistics open time
  C: z.number(), // Statistics close time
  F: z.number(), // First trade ID
  L: z.number(), // Last trade Id
  n: z.number(), // Total number of trades
});

export const BinanceCommandResponse = z.object({
  result: z.nullable(z.string()),
  id: z.number(),
});

export const BinanceMessage = z.union([Binance24hTickerMessage, BinanceCommandResponse]);

export const BinanceSubscribeCommand = z.object({
  method: z.literal('SUBSCRIBE'),
  params: z.array(z.string()),
  id: z.number(),
});

export const BinanceUnsubscribeCommand = z.object({
  method: z.literal('UNSUBSCRIBE'),
  params: z.array(z.string()),
  id: z.number(),
});

export const BinanceCommand = z.union([BinanceSubscribeCommand, BinanceUnsubscribeCommand]);
