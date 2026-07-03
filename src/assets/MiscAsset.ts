import { ImageAssetManager } from "../core/Assets/Asset";

export enum MiscAssetId {
    GROUND = "ground",
    WALL = "wall",
    BULLET = "bullet",
    BUTTON = "bouton",
    BUTTON_BLEU = "bouton_bleu",
}

class MiscAssetManager extends ImageAssetManager<MiscAssetId, string> {
    protected getIds(): MiscAssetId[] {
        return Object.values(MiscAssetId);
    }

    protected getAssetFileLink(assetKey: string, asset: string): string {
        return `assets/${assetKey}/${asset}.png`;
    }

    constructor() {
        super(
            "misc",
            {
                [MiscAssetId.GROUND]: "ground",
                [MiscAssetId.WALL]: "wall",
                [MiscAssetId.BULLET]: "menuBalle",
                [MiscAssetId.BUTTON]: "BoutonSauvage",
                [MiscAssetId.BUTTON_BLEU]: "BoutonSauvageBleu",
            },
            {
                [MiscAssetId.GROUND]: { width: 1, height: 1 },
                [MiscAssetId.WALL]: { width: 1, height: 1 },
                [MiscAssetId.BULLET]: { width: 1, height: 1 },
                [MiscAssetId.BUTTON]: { width: 180, height: 50 },
                [MiscAssetId.BUTTON_BLEU]: { width: 180, height: 50 },
            },
        );
    }
}

export const MiscAsset = new MiscAssetManager();

