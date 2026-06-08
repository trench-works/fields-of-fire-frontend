import { Scene } from "phaser";
import { SceneAssetId } from "../../assets/ScenesAsset";
import {
    BackgroundAsset,
    BackgroundAssetId,
} from "../../assets/BackgroundAsset";
import { Grid } from "../Utils";
import { TwoAxis } from "../Types";

export class BaseScene extends Scene {
    public rootGrid: Grid;

    constructor(
        key: SceneAssetId,
        protected readonly background: BackgroundAssetId,
        rootGridOptions?: { division: TwoAxis },
    ) {
        super({ key });
        this.rootGrid = new Grid(rootGridOptions);
    }

    preload() {
        BackgroundAsset.load(this.load, this.background);
    }

    create() {
        const bg = this.add
            .image(0, 0, BackgroundAsset.getAssetKey(this.background))
            .setOrigin(0, 0)
            .setDepth(-1);
        bg.setDisplaySize(this.scale.width, this.scale.height);
    }
}

