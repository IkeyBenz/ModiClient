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
declare interface GameState {
  players: { [playerId: string]: Player };
  orderedPlayerIds: string[];
  dealerId: string | null;
  activePlayerId: string | null;
  version: number;
}

type TailoredCardMap = (Card | boolean)[];

declare type StateChangeAction =
  | HighcardWinnersDispatch
  | StartRoundDispatch
  | DealCardsDispatch
  | RemoveCardsDispatch
  | PlayerHitDeckDispatch
  | PlayersTradedDispatch
  | PlayersTurnDispatch;

type HighcardWinnersDispatch = {
  type: 'HIGHCARD_WINNERS';
  payload: { playerIds: string[] }
};
type DealCardsDispatch = {
  type: 'DEALT_CARDS';
  payload: {
    cards: TailoredCardMap,
    dealerId: string,
  }
};
type RemoveCardsDispatch = {
  type: 'REMOVE_CARDS',
  payload: {}
};
type PlayerHitDeckDispatch = {
  type: 'PLAYER_HIT_DECK';
  payload: { playerId: string; card: Card }
};
type StartRoundDispatch = {
  type: 'START_ROUND';
  payload: { dealerId: string; activePlayerId: string };
}
type PlayersTradedDispatch = {
  type: 'PLAYERS_TRADED';
  payload: { fromPlayerId: string; toPlayerId: string };
};
type PlayersTurnDispatch = {
  type: 'PLAYERS_TURN';
  payload: {
    playerId: string;
    controls: ControlsType;
  }
}
type ControlsType = 'Start Highcard' | 'Deal Cards' | 'Stick/Swap' | 'Hit Deck' | 'Choose Dealer';

type ConnectionResponseDto = {
  username: string;
  connected: boolean;
  playerId: string;
}[];

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
  | ['start game']
  | ['deal cards'];

type GameSocketClientOnArgs =
  | ['connect', () => void]
  | ['disconnect', () => void]
  | ['state change', StateChangeCallback]
  | ['connections', (connections: ConnectionResponseDto) => void]
  | ['error message', (message: string) => void]
  | ['received move', () => void]
  | ['not your turn', () => void]
  | ['choice for dealer received', () => void];

interface GameSocketClient extends SocketIOClient.Socket {
  emit: (...dispatch: GameSocketClientEmitArgs) => this;
  on: (...event: GameSocketClientOnArgs) => any; // TODO: couldnt figure out proper return type
}

interface GameRoomClientCallbacks {
  onConnectionsChanged(connections: ConnectionResponseDto): any;
  onDisconnect(): any;
  onError(message: string): any;
  onStateChange: StateChangeCallback;
}
interface GameSocketConfig extends GameRoomClientCallbacks {
  url: string;
  username: string;
  playerId: string;
}

interface GameRoomClientController {
  disconnect(): void;
  initiateHighcard(): void;
  dealCards(): void;
  makeMove(move: PlayerMove): void;
  chooseDealer(dealerId: string): void;
}

declare module '@modiapp/client' {
  function connectToGameSocket(config: GameSocketConfig): Promise<GameRoomClientController>;
}
