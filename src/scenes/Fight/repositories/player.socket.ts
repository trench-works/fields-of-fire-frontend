import { GameAnimation, Position, Socket, SocketListener } from "../../../core";
import { AnimatedPayload } from "../../../core";
import { Game } from "../../../Model/Game";
const GAME_TOPIC = "game";
/**
 * Game Player
 */

enum GamePlayerActions {
    ACTION = "action",
    FINISH_TURN = "finish-turn",
}

enum GamePlayerEvents {
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

export type GameEventAnimation =
    | GameAnimation<"move", { entityId: string }>
    | GameAnimation<"attack", { entityId: string; actionId: string }>;

export type GameUpdateEvent = AnimatedPayload<Game, GameEventAnimation>;

export class GamePlayerSocket extends Socket<GamePlayerKey, GamePlayerActions> {
    constructor(gameId: string, playerId: string) {
        super(GAME_TOPIC);
        super.open({ gameId, playerId });
    }

    finishTurn() {
        return this.send(GamePlayerActions.FINISH_TURN);
    }

    action(actionPlayer: ActionPlayer) {
        return this.send(GamePlayerActions.ACTION, actionPlayer);
    }

    onUpdate(listener: SocketListener<GameUpdateEvent>): void {
        this.on(GamePlayerEvents.UPDATE, listener);
    }
}

