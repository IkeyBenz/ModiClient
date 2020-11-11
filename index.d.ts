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
  card: Card | boolean;
  move: AdjustedPlayerMove | null;
}

type StateChangeCallback = (action: StateChangeAction, version: number) => void;
type Connections = {
  [playerId: string]: { username: string; connected: boolean };
};
declare interface GameState {
  players: { [playerId: string]: Player };
  orderedPlayerIds: string[];
  dealerId: string | null;
  activePlayerId: string | null;
  version: number;
};
interface TailoredGameState extends GameState {
  players: { [playerId: string]: TailoredPlayer };
}

type TailoredCardMap = [Card | boolean, string][];

declare type StateChangeAction =
  | HighcardWinnersDispatch
  | StartRoundDispatch
  | DealCardsDispatch
  | RemoveCardsDispatch
  | PlayerHitDeckDispatch
  | PlayersTradedDispatch;

type HighcardWinnersDispatch = { type: 'HIGHCARD_WINNERS'; payload: { playerIds: string[] } };
type DealCardsDispatch = { type: 'DEALT_CARDS'; payload: { cards: TailoredCardMap } };
type RemoveCardsDispatch = { type: 'REMOVE_CARDS', payload: {} };
type PlayerHitDeckDispatch = { type: 'PLAYER_HIT_DECK'; payload: { playerId: string; card: Card } };
type StartRoundDispatch = {
  type: 'START_ROUND';
  payload: { dealerId: string; activePlayerId: string };
}
type PlayersTradedDispatch = {
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