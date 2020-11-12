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

type ConnectionResponseDto = {
  [playerId: string]: {
    username: string;
    connected: boolean;
  };
};
type DealerRequestDto = { dealerId: string };

interface GameRoomConnection {
  onConnectionsChanged(connections: ConnectionResponseDto): any;
  onError(message: string): any;
  onGameStateChanged: StateChangeCallback;
  username: string;
  playerId: string;
}

type GameSocketClientEmitArgs =
  | ['get connections']
  | ['get live updates', number?]
  | ['get subscribers']
  | ['get initial state']
  | ['make move', PlayerMove]
  | ['choose dealer', string]
  | ['start game'];

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
type GameSocketConfig = {
  url: string;
  username: string;
  playerId: string;
  onConnectionsChanged(connections: ConnectionResponseDto): any;
  onDisconnect(): any;
  onStateChange: StateChangeCallback;
}

interface GameRoomClient {
  disconnect(): void;
  initiateHighcard(): void;
}
declare function connectToGameSocket(config: GameSocketConfig): GameRoomClient;
declare module '@modiapp/client' {
  exports = {
    connectToGameSocket
  };
}