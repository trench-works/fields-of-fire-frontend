import { Position, Socket } from "../../../core";
const USER_ID = "dev";
const GAME_TOPIC = "game";
/**
 * Game Player
 */

enum GamePlayerActions {
    ACTION = "action",
}

type GamePlayerKey = {
    gameId: string;
    playerId: string;
};

type ActionPlayer = {
    actionId: string;
    target: Position;
};

export class GamePlayerSocket extends Socket<GamePlayerKey, GamePlayerActions> {
    constructor(gameId: string, playerId: string) {
        super(GAME_TOPIC);
        super.open(USER_ID, { gameId, playerId });
    }

    action(actionPlayer: ActionPlayer) {
        return this.send<ActionPlayer>(GamePlayerActions.ACTION, actionPlayer);
    }
}

