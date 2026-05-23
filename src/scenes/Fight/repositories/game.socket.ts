import { Position, Socket, SocketListener } from "../../../core";

const GAME_TOPIC = "game";

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

type EntityMove = {
    entity: {
        entityId: string;
        position: Position;
    };
};
export class GameSocket extends Socket<GameKey, GameActions, string> {
    constructor(gameId: string) {
        super(GAME_TOPIC);
        super.open({ gameId });
    }

    leave(): void | Error {
        return this.send(GameActions.LEAVE, {});
    }

    onMove(listener: SocketListener<EntityMove>): void {
        this.on(GameEvents.MOVE, listener);
    }
}

