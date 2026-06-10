import { ImageAssetManager } from "../core/Assets/Asset";

export enum IconAssetId {
    ARMOR = "armor",
    DODGING = "dodging",
    ENERGY = "energy",
    INITIATIVE = "initiative",
    LIFE = "life",
    MOUVEMENT = "mouvement",
    PRECISION = "precision",
    STRENGTH = "strength",
}

class IconAssetManager extends ImageAssetManager<IconAssetId, string> {
    protected getIds(): IconAssetId[] {
        return Object.values(IconAssetId);
    }

    protected getAssetFileLink(assetKey: string, asset: string): string {
        return `assets/${assetKey}/${assetKey}_${asset}.png`;
    }

    constructor() {
        super(
            "icon",
            {
                [IconAssetId.ARMOR]: IconAssetId.ARMOR,
                [IconAssetId.DODGING]: IconAssetId.DODGING,
                [IconAssetId.ENERGY]: IconAssetId.ENERGY,
                [IconAssetId.INITIATIVE]: IconAssetId.INITIATIVE,
                [IconAssetId.LIFE]: IconAssetId.LIFE,
                [IconAssetId.MOUVEMENT]: IconAssetId.MOUVEMENT,
                [IconAssetId.PRECISION]: IconAssetId.PRECISION,
                [IconAssetId.STRENGTH]: IconAssetId.STRENGTH,
            },
            {
                [IconAssetId.ARMOR]: { width: 1, height: 1 },
                [IconAssetId.DODGING]: { width: 1, height: 1 },
                [IconAssetId.ENERGY]: { width: 1, height: 1 },
                [IconAssetId.INITIATIVE]: { width: 1, height: 1 },
                [IconAssetId.LIFE]: { width: 1, height: 1 },
                [IconAssetId.MOUVEMENT]: { width: 1, height: 1 },
                [IconAssetId.PRECISION]: { width: 1, height: 1 },
                [IconAssetId.STRENGTH]: { width: 1, height: 1 },
            },
        );
    }
}

export const IconAsset = new IconAssetManager();

