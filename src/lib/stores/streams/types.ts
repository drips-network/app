/** \<receiver-user-id\>-\<receiver-config\> */
export type StreamId = string;
export type UserId = string;

interface AddressDriverUser {
  driver: 'address';
  address: string;
  userId: UserId;
}

export type User = AddressDriverUser;

interface Amount {
  tokenAddress: string;
  amount: bigint;
}

export interface DripsConfig {
  /** The raw on-chain config value. */
  raw: bigint;
  /** The drips receiver ID. */
  id: string;
  amountPerSecond: Amount;
  /** If undefined, stream starts at the block timestamp its receiver was created on. */
  startDate?: Date;
  /** If undefined, stream runs until out of funds. */
  durationSeconds?: number;
}

export interface Stream {
  id: StreamId;
  sender: User;
  receiver: User;
  /** Initial stream settings, not taking into account a paused stream. */
  dripsConfig: DripsConfig;
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

export interface AssetConfigHistoryItem {
  timestamp: Date;
  balance: Amount;
  /**
   * Undefined if there are no streams, the balance is zero, or all streams end before
   * the balance is depleted.
   */
  runsOutOfFunds?: Date;
  streams: {
    streamId: string;
    /** If undefined, stream is paused. */
    dripsConfig?: DripsConfig;
    /**
     * If true, the stream was created through the Drips App. If false, it was created
     * by an unknown third party application.
     */
    managed: boolean;
  }[];
}

export interface AssetConfig {
  /** The token address this asset config describes. */
  tokenAddress: string;
  /** Streams for this particular asset. */
  streams: Stream[];
  history: AssetConfigHistoryItem[];
}

export interface Account {
  user: User;
  name?: string;
  description?: string;
  emoji?: string;
  assetConfigs: AssetConfig[];
  lastUpdated?: Date;
  lastUpdatedByAddress?: string;
  lastIpfsHash?: string;
}
