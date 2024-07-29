export enum Forge {
  gitHub = 0,
  gitLab = 1,
}

export type OxString = `0x${string}`;

export type SplitsReceiver = {
  accountId: string;
  weight: number;
};

export type StreamReceiver = {
  accountId: bigint;
  config: bigint;
};

export type CallerCall = {
  target: OxString;
  data: OxString;
  value: bigint;
};
