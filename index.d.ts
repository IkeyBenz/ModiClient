type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
type Suit = 'spades' | 'hearts' | 'clubs' | 'diamonds';
interface Card {
  rank: Rank;
  suit: Suit;
}
type PlayerMove = 'swap' | 'stick' | 'hit deck';
type AdjustedPlayerMove = PlayerMove | 'attempted-swap';
interface Player {
  id: string;
  lives: number;
  card: Card | null;
  move: AdjustedPlayerMove | null;
}
type StateChangeCallback = (action: StateChangeAction, version: number) => void;
type Connections = {
  [playerId: string]: { username: string; connected: boolean };
};
declare type GameState = {
  players: { [playerId: string]: Player };
  orderedPlayerIds: string[];
  dealerId: string | null;
  activePlayerId: string | null;
  version: number;
};
/** Tailored on a per client basis, to ensure that no client can
 * be aware of other players cards when they're not suppose to
 */
type TailoredCardMap = [Card | boolean, string][];

declare type StateChangeAction =
  | { type: 'HIGHCARD_WINNERS'; payload: { playerIds: string[] } }
  | {
      type: 'START_ROUND';
      payload: { dealerId: string; activePlayerId: string };
    }
  | { type: 'DEALT_CARDS'; payload: { cards: [Card | boolean, string][] } }
  | { type: 'REMOVE_CARDS' }
  | { type: 'PLAYER_HIT_DECK'; payload: { playerId: string; card: Card } }
  | {
      type: 'PLAYERS_TRADED';
      payload: { fromPlayerId: string; toPlayerId: string };
  };
    

type GameSocketClientEmitArgs =
  | ['get connections']
  | ['get live updates', number?]
  | ['get subscribers']
  | ['get initial state']
  | ['make move', PlayerMove]
  | ['choose dealer', string];

type GameSocketClientOnArgs =
  | ['connect', () => void]
  | ['disconnect', () => void]
  | ['state change', StateChangeCallback]
  | ['subscribers', (playerIds: string[]) => void]
  | ['connections', (connections: Connections) => void]
  | ['initial state', (initialGameState: GameState) => void]
  | ['received move', () => void]
  | ['not your turn', () => void]
  | ['choice for dealer received', () => void];

interface GameSocketClient extends SocketIOClient.Socket {
  emit: (...dispatch: GameSocketClientEmitArgs) => this;
  on: (...event: GameSocketClientOnArgs) => any; // TODO: couldnt figure out proper return type
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

declare module '@modiapp/client' {
  export default GameRoomClient;
}