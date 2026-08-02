import { ImageAssetManager } from "../core/Assets/Asset";

export enum MiscAssetId {
    GROUND = "ground",
    WALL = "wall",
    BULLET = "bullet",
    BUTTON = "bouton",
    BUTTON_BLUE = "bouton_bleu",
    BUTTON_ROUND = "bouton_round",
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
                [MiscAssetId.BUTTON_BLUE]: "BoutonSauvageBleu",
                [MiscAssetId.BUTTON_ROUND]: "BoutonSauvageRond",
            },
            {
                [MiscAssetId.GROUND]: { width: 1, height: 1 },
                [MiscAssetId.WALL]: { width: 1, height: 1 },
                [MiscAssetId.BULLET]: { width: 1, height: 1 },
                [MiscAssetId.BUTTON]: { width: 180, height: 50 },
                [MiscAssetId.BUTTON_BLUE]: { width: 180, height: 50 },
                [MiscAssetId.BUTTON_ROUND]: { width: 50, height: 50 },
            },
            {
                [MiscAssetId.GROUND]: { frameWidth: 64, frameHeight: 64 },
            },
        );
    }
}

export const MiscAsset = new MiscAssetManager();

