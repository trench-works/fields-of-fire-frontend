import {
    AnimatedPayload,
    GameAnimation,
    Position,
    SocketListener,
} from "../../../core";
import { Boost } from "../../../Model/Boost";
import { Game } from "../../../Model/Game";
import { FightSceneRoot } from "../fight-scene.root";
import { GamePlayerActions, GamePlayerEvents } from "./player.socket";

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
        path?: Position[];
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

export type PlayerReady = { boostId: string | null };

export type GameUpdateEvent = AnimatedPayload<Game, GameEventAnimation>;

export type GameEndEvent = { boosts: Boost[]; playerWin: boolean };

export type GameRenew = { data: Game };

export class GameRepository {
    constructor(private readonly root: FightSceneRoot) {}

    readyForNewGame(boostId: string | null) {
        console.log("rdyFrNewGame called");
        return this.root.playerSocket?.send<PlayerReady>(
            GamePlayerActions.READY,
            { boostId },
        );
    }

    disconnect() {
        this.root.playerSocket?.send(GamePlayerActions.DISCONNECT);
        this.root.playerSocket?.close();
    }

    onUpdate(listener: SocketListener<GameUpdateEvent>): void {
        this.root.playerSocket?.on(GamePlayerEvents.UPDATE, listener);
    }

    onGameEnd(listener: SocketListener<GameEndEvent>): void {
        this.root.playerSocket?.on(GamePlayerEvents.GAME_END, listener);
    }

    onGameRenew(listener: SocketListener<GameRenew>): void {
        this.root.playerSocket?.on(GamePlayerEvents.GAME_RENEW, listener);
    }
}

