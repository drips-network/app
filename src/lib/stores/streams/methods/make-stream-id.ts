/**
 * Create a Stream ID string, including the stream's initial receiverUserId and dripsConfig.
 * @param receiverUserId The stream's receiverUserId.
 * @param dripsConfig The stream's initial DripsConfig.
 * @returns The stream ID string.
 */
export default function makeStreamId(receiverUserId: string, dripsConfig: string) {
  return `${receiverUserId}-${dripsConfig}`;
}
