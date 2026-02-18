import { Socket } from "../core/Socket";

const GAME_TOPIC = "game";
export type JoinGame = {
    gameId: string;
};

/**
 * Game Defautl Socket (only for testing purpose, should be removed later)
 */

export class GamesSocket extends Socket {
    constructor(userId: string) {
        super(GAME_TOPIC, userId, {});
    }

    joinGame(joinGame: JoinGame) {
        this.send<JoinGame>("join", joinGame);
    }
}

/**
 * Current Game
 */

export type GameKey = {
    gameId: string;
};

export class GameSocket extends Socket<GameKey> {
    constructor(userId: string, gameId: string) {
        super(GAME_TOPIC, userId, { gameId });
    }
}

/**
 * Game Player
 */

enum GamePlayerActions {
    MOVE = "move",
}

export type GamePlayerKey = {
    gameId: string;
    playerId: string;
};

export type MovePlayer = {
    x: number;
    y: number;
};

export class GamePlayerSocket extends Socket<GamePlayerKey, GamePlayerActions> {
    constructor(userId: string, gameId: string, playerId: string) {
        super(GAME_TOPIC, userId, { gameId, playerId });
    }

    move(movePlayer: MovePlayer) {
        this.send<MovePlayer>(GamePlayerActions.MOVE, movePlayer);
    }
}

