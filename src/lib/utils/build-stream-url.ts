export default (senderAccountId: string, tokenAddress: string, streamId: string) =>
  `/app/${senderAccountId}/tokens/${tokenAddress}/streams/${streamId}`;
