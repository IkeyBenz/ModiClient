import io from 'socket.io-client';

export function connectToGameSocket({
  url,
  username,
  playerId,
  onConnectionsChanged,
  onStateChange,
  onDisconnect,
}: GameSocketConfig): Promise<GameRoomClient> {
  return new Promise((resolve) => {
    const socket = io(url, { query: { username, playerId } }) as GameSocketClient;
 
    socket.on('connect', () => {
      resolve(createGameRoomClient(socket));
      socket.on('connections', onConnectionsChanged);
      socket.on('state change', onStateChange);
      socket.on('disconnect', onDisconnect);
    });
  })
}

function createGameRoomClient(socket: GameSocketClient): GameRoomClient {
  return {
    disconnect: () => socket.disconnect(),
    initiateHighcard: () => socket.emit('start game'),
  }
}
