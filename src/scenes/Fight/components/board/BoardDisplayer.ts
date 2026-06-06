import { MiscAsset, MiscAssetId } from "../../../../assets";
import { Position } from "../../../../core";
import { Diamond } from "../../../../core/Objects/Diamond";
import { scaleAndCenter } from "../../../../core/Utils/Scale";
import { EntityType } from "../../../../Model/Entity";
import { FightScene } from "../../fight.scene";
import { ClassStore } from "../../stores/ClassStore";
import { GameStore } from "../../stores/GameStore";
import { PlayerStore } from "../../stores/PlayerStore";
import { FightSceneDisplayer } from "../FightSceneDisplayer";
import { GroundDisplayer } from "./GroundDisplayer";
import { WallDisplayer } from "./WallDisplayer";

export class BoardDisplayer extends FightSceneDisplayer {
    private groundDisplayer: GroundDisplayer;
    private wallDisplayer: WallDisplayer;

    constructor(
        scene: FightScene,
        gameStore: GameStore,
        classStore: ClassStore,
        playerStore: PlayerStore,
    ) {
        super(scene, gameStore);
        this.groundDisplayer = new GroundDisplayer(
            scene,
            gameStore,
            classStore,
            playerStore,
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

    async animate(): Promise<this> {
        return this;
    }
}

