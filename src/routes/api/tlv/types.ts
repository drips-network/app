export type TLVResult = { tokenAddress: string; amount: bigint; decimals: number };
export type TLVSourceFn = (f: typeof fetch) => Promise<TLVResult[]>;
