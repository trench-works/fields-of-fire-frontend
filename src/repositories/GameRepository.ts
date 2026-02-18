import { Socket } from "../core/web/Socket";
const USER_ID = "dev";
const GAME_TOPIC = "game";

type JoinGame = {
    gameId: string;
};

/**
 * Game Defautl Socket (only for testing purpose, should be removed later)
 */

export class GamesSocket extends Socket {
    constructor() {
        super(GAME_TOPIC);
        super.open(USER_ID);
    }

    joinGame(joinGame: JoinGame) {
        return this.send<JoinGame>("join", joinGame);
    }
}

/**
 * Current Game
 */

type GameKey = {
    gameId: string;
};

enum GameActions {
    LEAVE = "leave",
}

enum GameEvents {
    MOVE = "move",
}

type PlayerMove = {
    plyerId: string;
    x: number;
    y: number;
};
export class GameSocket extends Socket<GameKey, GameActions, string> {
    constructor(gameId: string) {
        super(GAME_TOPIC);
        super.open(USER_ID, { gameId });
    }

    leave(): void | Error {
        return this.send(GameActions.LEAVE, {});
    }

    onMove(listener: (playerMove: PlayerMove) => void): void {
        this.on(GameEvents.MOVE, listener);
    }
}

/**
 * Game Player
 */

enum GamePlayerActions {
    MOVE = "move",
}

type GamePlayerKey = {
    gameId: string;
    playerId: string;
};

type MovePlayer = {
    x: number;
    y: number;
};

export class GamePlayerSocket extends Socket<GamePlayerKey, GamePlayerActions> {
    constructor(gameId: string, playerId: string) {
        super(GAME_TOPIC);
        super.open(USER_ID, { gameId, playerId });
    }

    move(movePlayer: MovePlayer) {
        return this.send<MovePlayer>(GamePlayerActions.MOVE, movePlayer);
    }
}

