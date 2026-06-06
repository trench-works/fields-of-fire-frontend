import { ImageAssetManager } from "../core/Assets/Asset";

export enum MiscAssetId {
    GROUND = "ground",
    WALL = "wall",
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
            [MiscAssetId.GROUND]: "ground",
            [MiscAssetId.WALL]: "wall",
            [MiscAssetId.BULLET]: "menuBalle",
        });
    }
}

export const MiscAsset = new MiscAssetManager();

