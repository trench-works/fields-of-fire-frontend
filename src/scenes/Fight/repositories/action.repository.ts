import { Position, SocketListener } from "../../../core";
import { FightSceneRoot } from "../fight-scene.root";
import { GamePlayerActions, GamePlayerEvents } from "./player.socket";

type ActionPlayer = {
    actionId: string;
    target: Position;
};

export type PlayerCancelAction = {
    reason: "energy" | "mouvement" | "occupied" | "target-visible";
};

export class ActionRepository {
    constructor(private readonly root: FightSceneRoot) {}

    finishTurn() {
        return this.root.playerSocket?.send(GamePlayerActions.FINISH_TURN);
    }

    async action(actionPlayer: ActionPlayer) {
        return await this.root.playerSocket?.send(
            GamePlayerActions.ACTION,
            actionPlayer,
        );
    }

    onActionCancel(listener: SocketListener<PlayerCancelAction>): void {
        this.root.playerSocket?.on(GamePlayerEvents.CANCEL_ACTION, listener);
    }
}

