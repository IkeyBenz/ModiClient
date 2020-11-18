import io from 'socket.io-client';

export function connectToGameSocket({
  url,
  username,
  playerId,
  onConnectionsChanged,
  onStateChange,
  onDisconnect,
  onError,
}: GameSocketConfig): Promise<GameRoomClientController> {
  return new Promise((resolve) => {
    const socket = io(url, { query: { username, playerId } }) as GameSocketClient;
 
    socket.on('connect', () => {
      const grController = createGameRoomClientController(socket);
      resolve(grController);

      socket.on('connections', onConnectionsChanged);
      socket.on('state change', onStateChange);
      socket.on('disconnect', onDisconnect);
      socket.on('error message', onError);
    });
  })
}

function createGameRoomClientController(socket: GameSocketClient): GameRoomClientController {
  return {
    disconnect: () => socket.disconnect(),
    initiateHighcard: () => socket.emit('start game'),
  }
}
