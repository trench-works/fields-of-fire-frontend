import { Position, Socket, SocketListener } from "../../../core";
import { Game } from "../../../Model/Game";
const GAME_TOPIC = "game";
/**
 * Game Player
 */

enum GamePlayerActions {
    ACTION = "action",
}

enum GamePlayerEvents {
    MOVE = "move",
    UPDATE = "update",
}

type GamePlayerKey = {
    gameId: string;
    playerId: string;
};

type ActionPlayer = {
    actionId: string;
    target: Position;
};

type EntityMove = {
    entity: {
        entityId: string;
        position: Position;
    };
};

export class GamePlayerSocket extends Socket<GamePlayerKey, GamePlayerActions> {
    constructor(gameId: string, playerId: string) {
        super(GAME_TOPIC);
        super.open({ gameId, playerId });
    }

    action(actionPlayer: ActionPlayer) {
        return this.send(GamePlayerActions.ACTION, actionPlayer);
    }

    onMove(listener: SocketListener<EntityMove>): void {
        this.on(GamePlayerEvents.MOVE, listener);
    }

    onUpdate(listener: SocketListener<Game>): void {
        this.on(GamePlayerEvents.UPDATE, listener);
    }
}

