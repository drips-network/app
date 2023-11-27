export default (senderAddress: string, tokenAddress: string, streamId: string) =>
  `/app/${senderAddress}/tokens/${tokenAddress}/streams/${streamId}`;
