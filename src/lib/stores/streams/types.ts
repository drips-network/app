/** \<senderAccountId\>-\<tokenAddress\>-\<dripId\> */
export type StreamId = string;
export type AccountId = string;

export interface AddressDriverAccount {
  driver: 'address';
  address: string;
  accountId: AccountId;
}

export interface NFTDriverAccount {
  driver: 'nft';
  accountId: AccountId;
}

interface Amount {
  tokenAddress: string;
  amount: bigint;
}

export interface DripsConfig {
  /** The raw on-chain config value. */
  raw: bigint;
  dripId: string;
  /**
   * The amount per second in the smallest possible unit of the respective token, plus
   * extra decimal precision provided by Drips. To get an amount in the token decimal
   * unit, divide by 10 ^ 18.
   */
  amountPerSecond: Amount;
  /** If undefined, stream starts at the block timestamp its receiver was created on. */
  startDate?: Date;
  /** If undefined, stream runs until out of funds. */
  durationSeconds?: number;
}

export interface Stream {
  id: StreamId;
  sender: AddressDriverAccount;
  receiver: AddressDriverAccount | NFTDriverAccount;
  /** Initial stream settings, not taking into account a paused stream. */
  streamConfig: DripsConfig;
  paused: boolean;
  name?: string;
  description?: string;
  /** If true, the stream should generally be hidden across the UI. */
  archived?: boolean;
  /**
   * If true, the stream was created through the Drips App. If false, it was created
   * by an unknown third party application.
   */
  managed: boolean;
}

export interface Receiver {
  streamId: string;
  /** If undefined, stream is paused. */
  streamConfig?: DripsConfig;
  /**
   * If true, the stream was created through the Drips App. If false, it was created
   * by an unknown third party application.
   */
  managed: boolean;
  receiver: AddressDriverAccount | NFTDriverAccount;
}

export interface AssetConfigHistoryItem {
  timestamp: Date;
  balance: Amount;
  /**
   * Undefined if there are no streams, the balance is zero, or all streams end before
   * the balance is depleted.
   */
  runsOutOfFunds?: Date;
  streams: Receiver[];
  historyHash: string;
  receiversHash: string;
}

export interface AssetConfig {
  /** The token address this asset config describes. */
  tokenAddress: string;
  /** Streams for this particular asset. */
  streams: Stream[];
  history: AssetConfigHistoryItem[];
}

export interface Account {
  user: AddressDriverAccount;
  name?: string;
  description?: string;
  emoji?: string;
  assetConfigs: AssetConfig[];
  lastUpdated?: Date;
  lastUpdatedByAddress?: string;
  lastIpfsHash?: string;
  /**
   * Drip Lists are NFTs, meaning that they can be transferred to any address without the receiving party's consent.
   * The app only displays Drip Lists that are included in this array on their profile, so that users are always
   * in control of what appears on their profiles.
   *
   * If undefined, there is no setting for this account, meaning it either has old metadata or no metadata at all.
   */
  visibleDripListAccountIds: string[] | undefined;
}
