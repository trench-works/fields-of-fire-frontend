import { ImageAssetManager } from "../core/Assets/Asset";

export enum StatsAssetId {
    ENERGY = "energy",
    MOUVEMENT = "mouvement",
    ARMOR = "armor",
    DODGING = "dodging",
    INITIATIVE = "initiative",
    LIFE = "life",
    PRECISION = "precision",
    STRENGTH = "strength",
    INTELLIGENCE = "intelligence",
    CRITICAL = "critical"
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
                //new stat
                [StatsAssetId.INTELLIGENCE]: StatsAssetId.INTELLIGENCE,
                [StatsAssetId.CRITICAL]: StatsAssetId.CRITICAL,
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
                [StatsAssetId.INTELLIGENCE]: { width: 1, height: 1 },
                [StatsAssetId.CRITICAL]: { width: 1, height: 1 },
            },
        );
    }
}

export const StatsIconAsset = new StatsIconAssetManager();

