import { Scene } from "phaser";
import { SceneAssetId } from "../../assets/ScenesAsset";
import {
    BackgroundAsset,
    BackgroundAssetId,
} from "../../assets/BackgroundAsset";

export class BaseScene extends Scene {
    constructor(
        key: SceneAssetId,
        protected readonly background: BackgroundAssetId,
    ) {
        super({ key });
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

