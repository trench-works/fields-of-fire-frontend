import { FightScene } from "../fight.scene";
import { ClassStore } from "../stores/class.store";
import { GameStore } from "../stores/game.store";
import { GridStore } from "../stores/grid.store";
import { PlayerStore } from "../stores/player.store";
import { ActionsService } from "../services/actions.service";
import { RangeService } from "../services/range.service";
import { CharactersDisplayer } from "./characters.displayer";
import { FightSceneDisplayer } from "./base/fight-scene.displayer";
import { GroundDisplayer } from "./ground.displayer";
import { WallDisplayer } from "./wall.displayer";

export class BoardDisplayer extends FightSceneDisplayer {
    private groundDisplayer: GroundDisplayer;
    private wallDisplayer: WallDisplayer;

    private groundStore: GridStore;

    constructor(
        scene: FightScene,
        gameStore: GameStore,
        classStore: ClassStore,
        playerStore: PlayerStore,
        character: CharactersDisplayer,
        actionManager: ActionsService,
        rangeManager: RangeService,
    ) {
        super(scene, gameStore);
        this.groundStore = new GridStore();
        this.groundDisplayer = new GroundDisplayer(
            scene,
            gameStore,
            classStore,
            playerStore,
            this.groundStore,
            character,
            actionManager,
            rangeManager,
        );
        this.wallDisplayer = new WallDisplayer(scene, gameStore);
    }

    preRender(): this {
        this.groundDisplayer.preRender();
        this.wallDisplayer.preRender();
        return this;
    }

    render(): this {
        this.groundDisplayer.render();
        this.wallDisplayer.render();
        return this;
    }

    update(): this {
        this.groundDisplayer.update();
        this.wallDisplayer.update();
        return this;
    }

    reset(): this {
        this.destroy().render().update();
        return this;
    }

    destroy(): this {
        this.groundDisplayer.clean();
        this.wallDisplayer.clean();
        return this;
    }

    async animate(): Promise<this> {
        return this;
    }
}

