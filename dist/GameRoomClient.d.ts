/// <reference types="socket.io-client" />
declare type GameSocketClientEmitArgs = ['get connections'] | ['get live updates', number?] | ['get subscribers'] | ['get initial state'] | ['make move', PlayerMove] | ['choose dealer', string];
declare type GameSocketClientOnArgs = ['connect', () => void] | ['disconnect', () => void] | ['state change', StateChangeCallback] | ['subscribers', (playerIds: string[]) => void] | ['connections', (connections: Connections) => void] | ['initial state', (initialGameState: GameState) => void] | ['received move', () => void] | ['not your turn', () => void] | ['choice for dealer received', () => void];
interface GameSocketClient extends SocketIOClient.Socket {
    emit: (...dispatch: GameSocketClientEmitArgs) => this;
    on: (...event: GameSocketClientOnArgs) => any;
}
declare class GameRoomClient {
    private nspUrl;
    private static connectedSockets;
    private accessToken;
    private username;
    private isConnected;
    private socket;
    private onConnect;
    constructor(gameId: string, accessToken: string, username: string);
    private createInitialSocket;
    get connected(): boolean;
    getSubscriptionStatus(): Promise<boolean>;
    connect(): Promise<GameSocketClient>;
    subscribeToLiveStateChanges(fromVersion: number, onStateChange: StateChangeCallback): Promise<void>;
    getInitialGameState(): Promise<GameState>;
    makeMove(move: PlayerMove): Promise<unknown>;
    static unplugConnectedSockets(): void;
    chooseDealer(dealerId: string): Promise<unknown>;
}
export default GameRoomClient;
