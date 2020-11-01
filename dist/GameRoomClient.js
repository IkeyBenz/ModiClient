"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = __importDefault(require("socket.io-client"));
class GameRoomClient {
    constructor(gameId, accessToken, username) {
        this.onConnect = null;
        this.nspUrl = `http://localhost:5000/games/${gameId}`;
        this.accessToken = accessToken;
        this.username = username;
        this.isConnected = false;
        this.socket = this.createInitialSocket();
    }
    createInitialSocket() {
        const socket = socket_io_client_1.default(this.nspUrl, {
            query: { accessToken: this.accessToken, username: this.username },
            autoConnect: false,
            forceNew: true,
        });
        socket.on('connect', () => {
            this.isConnected = true;
            this.onConnect && this.onConnect();
            socket.on('disconnect', () => {
                this.isConnected = false;
            });
        });
        return socket;
    }
    get connected() {
        return this.isConnected;
    }
    getSubscriptionStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.connected) {
                yield this.connect();
            }
            return new Promise((resolve, reject) => {
                this.socket.on('subscribers', (subscriberIds) => resolve(subscriberIds.includes(this.accessToken)));
                this.socket.emit('get subscribers');
            });
        });
    }
    connect() {
        return new Promise((resolve, reject) => {
            this.onConnect = () => {
                resolve();
                this.onConnect = null;
            };
            this.socket.connect();
            setTimeout(() => {
                reject(new Error('Request timed out. Could not connect to game socket.'));
            }, 2000);
        });
    }
    subscribeToLiveStateChanges(fromVersion, onStateChange) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.connected) {
                yield this.connect();
            }
            this.socket.on('state change', onStateChange);
            this.socket.emit('get live updates', fromVersion);
        });
    }
    getInitialGameState() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.connected) {
                yield this.connect();
            }
            return new Promise((resolve, reject) => {
                this.socket.on('initial state', (gamestate) => resolve(gamestate));
                this.socket.emit('get initial state');
                setTimeout(() => {
                    reject(new Error('Request for initial game state timed out.'));
                }, 2000);
            });
        });
    }
    makeMove(move) {
        return __awaiter(this, void 0, void 0, function* () {
            !this.connected && (yield this.connect());
            return new Promise((resolve, reject) => {
                this.socket.on('received move', () => resolve('success'));
                this.socket.on('not your turn', () => resolve('not your turn'));
                this.socket.emit('make move', move);
            });
        });
    }
    static unplugConnectedSockets() {
        GameRoomClient.connectedSockets.forEach((socket) => socket.disconnect());
        while (GameRoomClient.connectedSockets.length)
            GameRoomClient.connectedSockets.pop();
    }
    chooseDealer(dealerId) {
        return __awaiter(this, void 0, void 0, function* () {
            !this.connected && (yield this.connect());
            return new Promise((resolve, reject) => {
                this.socket.on('choice for dealer received', () => {
                    resolve();
                });
                this.socket.emit('choose dealer', dealerId);
                setTimeout(() => {
                    reject(new Error('Request to choose dealer timed out'));
                }, 3000);
            });
        });
    }
}
GameRoomClient.connectedSockets = [];
exports.default = GameRoomClient;
