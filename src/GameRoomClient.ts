import io from 'socket.io-client';

export function connectToGameSocket({
  url,
  username,
  playerId,
  fromEventVersion,
  onConnectionsChanged,
  onStateChange,
  onDisconnect,
  onError,
}: GameSocketConfig): Promise<GameRoomClientController> {
  return new Promise((resolve) => {
    const socket = io(url, { query: { username, playerId, fromEventVersion } }) as GameSocketClient;
 
    socket.on('connect', () => {
      resolve(createGameRoomClientController(socket));

      socket.on('connections', onConnectionsChanged);
      socket.on('state change', onStateChange);
      socket.on('disconnect', onDisconnect);
      socket.on('error message', onError);
    });
  });
}

function createGameRoomClientController(socket: GameSocketClient): GameRoomClientController {
  return {
    disconnect: () => socket.disconnect(),
    initiateHighcard: () => socket.emit('start game'),
    dealCards: () => socket.emit('deal cards'),
    makeMove: (move: PlayerMove) => socket.emit('make move', move),
    chooseDealer: (dealerId: string) => socket.emit('choose dealer', dealerId),
  }
}
