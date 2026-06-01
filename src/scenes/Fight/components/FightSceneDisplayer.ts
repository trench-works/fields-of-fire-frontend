import { Displayer } from "../../../core";
import { FightScene } from "../fight.scene";
import { GameStore } from "../stores/GameStore";

export abstract class FightSceneDisplayer extends Displayer {
    declare protected scene: FightScene;

    constructor(
        scene: FightScene,
        protected readonly gameStore: GameStore,
    ) {
        super(scene);
    }
}

