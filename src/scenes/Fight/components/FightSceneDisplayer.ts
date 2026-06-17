import { Displayer } from "../../../core";
import { Game } from "../../../Model/Game";
import { FightScene } from "../fight.scene";
import { GameEventAnimation } from "../repositories/player.socket";
import { GameStore } from "../stores/GameStore";

export abstract class FightSceneDisplayer extends Displayer<FightScene> {
    constructor(
        scene: FightScene,
        protected readonly gameStore: GameStore,
    ) {
        super(scene);
    }

    abstract animate(
        animation: GameEventAnimation,
        newGame: Game,
    ): Promise<this>;
}

