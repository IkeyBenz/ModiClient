import waitForExpect from 'wait-for-expect';

import { connectToGameSocket } from '../src/GameRoomClient';

describe('GameRoomClientTests', () => {
  test('can connect', async () => {
    const socketConfig = createMockSocketConfig('Ikey', '1');
    const gameRoom = await connectToGameSocket(socketConfig);

    gameRoom.disconnect();
  });

  test('can disconnect', async () => {
    const socketConfig = createMockSocketConfig('Ikey', '1');
    const gameRoom = await connectToGameSocket(socketConfig);

    gameRoom.disconnect();
    await waitForExpect(() => {
      expect(socketConfig.onDisconnect).toHaveBeenCalled();
    });

    
  });
test('gets alerted when connections change', async () => {
    const ikeysSocket = createMockSocketConfig('Ikey', '1');
    const ikeyClient = await connectToGameSocket(ikeysSocket);
    const mikeSocket = createMockSocketConfig('Mike', '3');
    const mikeClient = await connectToGameSocket(mikeSocket);
    await waitForExpect(() => {
      expect(mikeSocket.onConnectionsChanged).toHaveBeenNthCalledWith(1, [
        { username: 'Ikey', connected: true, playerId: '1' },
        { username: '', connected: false, playerId: '2' },
        { username: 'Mike', connected: true, playerId: '3' },
        { username: '', connected: false, playerId: '4' },
       ] as ConnectionResponseDto);
    });
    ikeyClient.disconnect();
    await waitForExpect(() => expect(ikeysSocket.onDisconnect).toHaveBeenCalled());
    await waitForExpect(() => {
      expect(mikeSocket.onConnectionsChanged).toHaveBeenNthCalledWith(2, [
        { username: 'Ikey', connected: false, playerId: '1' },
        { username: '', connected: false, playerId: '2' },
        { username: 'Mike', connected: true, playerId: '3' },
        { username: '', connected: false, playerId: '4' },
      ]);
    });
    mikeClient.disconnect();
  });
  
  test('first player can request to start highcard', async () => {
    const ikeysSocket = createMockSocketConfig('Ikey', '1');
    const ikeyClient = await connectToGameSocket(ikeysSocket);

    ikeyClient.initiateHighcard();
    await waitForExpect(() => {
      expect(ikeysSocket.onStateChange).toHaveBeenCalled();
    });

    ikeyClient.disconnect();
  });

});


type MockPlayerId = '1' | '2' | '3' | '4';
function createMockSocketConfig(username: string, playerId: MockPlayerId): GameSocketConfig {
  return {
    url: 'http://localhost:5000/games/1234',
    username,
    playerId,
    onConnectionsChanged: jest.fn(),
    onDisconnect: jest.fn(),
    onStateChange: jest.fn(),
  };
};
