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
        super("icon", {
            [IconAssetId.ARMOR]: IconAssetId.ARMOR,
            [IconAssetId.DODGING]: IconAssetId.DODGING,
            [IconAssetId.ENERGY]: IconAssetId.ENERGY,
            [IconAssetId.INITIATIVE]: IconAssetId.INITIATIVE,
            [IconAssetId.LIFE]: IconAssetId.LIFE,
            [IconAssetId.MOUVEMENT]: IconAssetId.MOUVEMENT,
            [IconAssetId.PRECISION]: IconAssetId.PRECISION,
            [IconAssetId.STRENGTH]: IconAssetId.STRENGTH,
        });
    }
}

export const IconAsset = new IconAssetManager();

