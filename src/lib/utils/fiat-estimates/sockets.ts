import type { ZodType, z } from 'zod';

function _destroy(socket: WebSocket) {
  socket.close();
}

function _handleMessage<MessageType extends ZodType>(
  schema: MessageType,
  e: MessageEvent<z.infer<MessageType>>,
  callback: (e: MessageEvent<z.infer<MessageType>>) => void,
) {
  const data = schema.parse(JSON.parse(e.data));
  callback({ ...e, data });
}

function _subscribe(
  socket: WebSocket,
  messageSchema: ZodType,
  callback: (e: MessageEvent) => void,
) {
  socket.addEventListener('message', (e) => _handleMessage(messageSchema, e, callback));
}

function _unsubscribe(socket: WebSocket, callback: (e: MessageEvent) => void) {
  socket.removeEventListener('message', callback);
}

function _send<MessageType extends ZodType>(
  socket: WebSocket,
  schema: MessageType,
  message: z.infer<MessageType>,
) {
  socket.send(JSON.stringify(schema.parse(message)));
}

export default function createSocket<MessageType extends ZodType, CommandType extends ZodType>(
  messageSchema: MessageType,
  commandSchema: CommandType,
  ...args: ConstructorParameters<typeof WebSocket>
): {
  socket: WebSocket;
  subscribe: (callback: (e: MessageEvent<z.infer<typeof messageSchema>>) => void) => void;
  unsubscribe: (callback: (e: MessageEvent<z.infer<typeof messageSchema>>) => void) => void;
  send: (message: z.infer<typeof commandSchema>) => void;
  destroy: () => void;
} {
  const socket = new WebSocket(...args);

  return {
    socket,
    subscribe: (callback: (e: MessageEvent<z.infer<MessageType>>) => void) =>
      _subscribe(socket, messageSchema, callback),
    unsubscribe: (callback: (e: MessageEvent<z.infer<CommandType>>) => void) =>
      _unsubscribe(socket, callback),
    send: (message: z.infer<CommandType>) => _send(socket, commandSchema, message),
    destroy: () => _destroy(socket),
  };
}
