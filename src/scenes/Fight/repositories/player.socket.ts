import { GameAnimation, Position, Socket, SocketListener } from "../../../core";
import { AnimatedPayload } from "../../../core";
import { ConnectionListener } from "../../../core/Objects/Loader";
import { Boost } from "../../../Model/Boost";
import { Game } from "../../../Model/Game";
const GAME_TOPIC = "game";
/**
 * Game Player
 */

enum GamePlayerActions {
    ACTION = "action",
    FINISH_TURN = "finish-turn",
    READY = "ready",
    DISCONNECT = "disconnect",
}

enum GamePlayerEvents {
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

type ActionPlayer = {
    actionId: string;
    target: Position;
};

export type PlayerCancelAction = {
    reason: "energy" | "mouvement" | "occupied" | "target-visible";
};

export type GameMoveAnimation = GameAnimation<
    "move",
    {
        entityId: string;
        path: Position[];
    }
>;
export type GameAttackAnimation = GameAnimation<
    "attack",
    {
        entityId: string;
        actionId: string;
        origin: Position;
        target: Position;
        hits: (Position & { damage: number })[];
    }
>;
export type GameDeathAnimation = GameAnimation<
    "death",
    {
        entityId: string;
    }
>;

export type GameEventAnimation =
    | GameMoveAnimation
    | GameAttackAnimation
    | GameDeathAnimation;

export type GameUpdateEvent = AnimatedPayload<Game, GameEventAnimation>;

export type GameEndEvent = { boosts: Boost[]; playerWin: boolean };

export type GameRenew = { data: Game };

export type PlayerReady = { boostId: string | null };

export class GamePlayerSocket
    extends Socket<GamePlayerKey, GamePlayerActions>
    implements ConnectionListener
{
    constructor(gameId: string, playerId: string) {
        super(GAME_TOPIC);
        super.open({ gameId, playerId });
    }

    onConnectionProgress(listener: (value: number) => void) {
        this.on<{ progress: number }>(
            GamePlayerEvents.CONNECTION_UPDATE,
            ({ progress }) => listener(progress),
        );
    }

    onConnectionComplete(listener: () => void) {
        this.on<{ progress: number }>(
            GamePlayerEvents.CONNECTION_UPDATE,
            ({ progress }) => {
                console.log("progress", progress);
                if (progress === 1) {
                    listener();
                }
            },
        );
    }

    removeConnectionListener() {
        console.log("WILL REMOVE LISTENERS NOW");
        this.removeListeners(GamePlayerEvents.CONNECTION_UPDATE);
    }

    finishTurn() {
        return this.send(GamePlayerActions.FINISH_TURN);
    }

    readyForNewGame(boostId: string | null) {
        console.log("rdyFrNewGame called");
        return this.send<PlayerReady>(GamePlayerActions.READY, { boostId });
    }

    disconnect() {
        this.send(GamePlayerActions.DISCONNECT);
        this.close();
    }

    async action(actionPlayer: ActionPlayer) {
        return await this.send(GamePlayerActions.ACTION, actionPlayer);
    }

    onUpdate(listener: SocketListener<GameUpdateEvent>): void {
        this.on(GamePlayerEvents.UPDATE, listener);
    }

    onGameEnd(listener: SocketListener<GameEndEvent>): void {
        this.on(GamePlayerEvents.GAME_END, listener);
    }

    onGameRenew(listener: SocketListener<GameRenew>): void {
        this.on(GamePlayerEvents.GAME_RENEW, listener);
    }

    onActionCancel(listener: SocketListener<PlayerCancelAction>): void {
        this.on(GamePlayerEvents.CANCEL_ACTION, listener);
    }
}

