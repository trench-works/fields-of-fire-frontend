import { Socket } from "../../../core";
const GAME_TOPIC = "game";
/**
 * Game Player
 */

export enum GamePlayerActions {
    ACTION = "action",
    FINISH_TURN = "finish-turn",
    READY = "ready",
    DISCONNECT = "disconnect",
}

export enum GamePlayerEvents {
    UPDATE = "update",
    GAME_END = "game-end",
    GAME_RENEW = "game-renew",
    CANCEL_ACTION = "cancel-action",
    CONNECTION_UPDATE = "connection-update",
}

type GamePlayerKey = {
    gameId: string;
    playerId: string;
};

export class GamePlayerSocket extends Socket<GamePlayerKey, GamePlayerActions> {
    constructor(gameId: string, playerId: string) {
        super(GAME_TOPIC);
        super.open({ gameId, playerId });
    }
}

