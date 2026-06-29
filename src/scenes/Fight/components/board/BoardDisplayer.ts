import { FightScene } from "../../fight.scene";
import { ClassStore } from "../../stores/ClassStore";
import { GameStore } from "../../stores/GameStore";
import { GroundStore } from "../../stores/GroundStore";
import { PlayerStore } from "../../stores/PlayerStore";
import { FightSceneDisplayer } from "../FightSceneDisplayer";
import { GroundDisplayer } from "./GroundDisplayer";
import { WallDisplayer } from "./WallDisplayer";

export class BoardDisplayer extends FightSceneDisplayer {
    private groundDisplayer: GroundDisplayer;
    private wallDisplayer: WallDisplayer;

    private groundStore: GroundStore;

    constructor(
        scene: FightScene,
        gameStore: GameStore,
        classStore: ClassStore,
        playerStore: PlayerStore,
    ) {
        super(scene, gameStore);
        this.groundStore = new GroundStore();
        this.groundDisplayer = new GroundDisplayer(
            scene,
            gameStore,
            classStore,
            playerStore,
            this.groundStore,
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

