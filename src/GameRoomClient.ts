import io from 'socket.io-client';


type GameSocketConfig = {
  url: string;
  username: string;
  playerId: string;
  onConnectionsChanged(connections: ConnectionResponseDto): any;
  onConnect(): any;
  onDisconnect(): any;
  onStateChange: StateChangeCallback;
}

export function connectToGameSocket({
  url,
  username,
  playerId,
  onConnectionsChanged,
  onStateChange
}: GameSocketConfig) {
  const socket = io(url, { query: { username, playerId } }) as GameSocketClient;
  socket.on('connect', () => {
    socket.on('connections', onConnectionsChanged);
    socket.on('state change', onStateChange);
  })
}