import { ImageAssetManager } from "../core/Assets/Asset";

export enum MiscAssetId {
    GROUND_TILE = "ground",
    BULLET = "bullet",
}

class MiscAssetManager extends ImageAssetManager<MiscAssetId, string> {
    protected getIds(): MiscAssetId[] {
        return Object.values(MiscAssetId);
    }

    protected getAssetFileLink(assetKey: string, asset: string): string {
        return `assets/${assetKey}/${asset}.png`;
    }

    constructor() {
        super("misc", {
            [MiscAssetId.GROUND_TILE]: "ground",
            [MiscAssetId.BULLET]: "menuBalle",
        });
    }
}

export const MiscAsset = new MiscAssetManager();

