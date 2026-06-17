import { ImageAssetManager } from "../core/Assets/Asset";

export enum StatsAssetId {
    ARMOR = "armor",
    DODGING = "dodging",
    ENERGY = "energy",
    INITIATIVE = "initiative",
    LIFE = "life",
    MOUVEMENT = "mouvement",
    PRECISION = "precision",
    STRENGTH = "strength",
}

class StatsIconAssetManager extends ImageAssetManager<StatsAssetId, string> {
    protected getIds(): StatsAssetId[] {
        return Object.values(StatsAssetId);
    }

    protected getAssetFileLink(assetKey: string, asset: string): string {
        return `assets/stats/icon/${asset}.png`;
    }

    constructor() {
        super(
            "icon",
            {
                [StatsAssetId.ARMOR]: StatsAssetId.ARMOR,
                [StatsAssetId.DODGING]: StatsAssetId.DODGING,
                [StatsAssetId.ENERGY]: StatsAssetId.ENERGY,
                [StatsAssetId.INITIATIVE]: StatsAssetId.INITIATIVE,
                [StatsAssetId.LIFE]: StatsAssetId.LIFE,
                [StatsAssetId.MOUVEMENT]: StatsAssetId.MOUVEMENT,
                [StatsAssetId.PRECISION]: StatsAssetId.PRECISION,
                [StatsAssetId.STRENGTH]: StatsAssetId.STRENGTH,
            },
            {
                [StatsAssetId.ARMOR]: { width: 1, height: 1 },
                [StatsAssetId.DODGING]: { width: 1, height: 1 },
                [StatsAssetId.ENERGY]: { width: 1, height: 1 },
                [StatsAssetId.INITIATIVE]: { width: 1, height: 1 },
                [StatsAssetId.LIFE]: { width: 1, height: 1 },
                [StatsAssetId.MOUVEMENT]: { width: 1, height: 1 },
                [StatsAssetId.PRECISION]: { width: 1, height: 1 },
                [StatsAssetId.STRENGTH]: { width: 1, height: 1 },
            },
        );
    }
}

export const StatsIconAsset = new StatsIconAssetManager();

