import { ImageAssetManager } from "../core/Assets/Asset";

export enum BoostAssetId {
    HEAL = "heal",
    ARMOR = "armor",
    VERSATILE = "versatile",
    STRENGTH = "strength",
    PRECISION = "precision",
    LIFE = "life",
    VAMPIRE = "vampire",
    REACTION = "reaction",
    ENERGY = "energy",
    ACCELERATION = "acceleration",
    DODGE = "dodge",
    HEAVY_GUN = "heavy_gun",
    STABILISATION = "stabilisation",
    SPRINT = "sprint",
    ALLEVIATE = "alleviate",
    MASOCHISTIC = "masochistic",
}

class BoostAssetManager extends ImageAssetManager<BoostAssetId, string> {
    protected getIds(): BoostAssetId[] {
        return Object.values(BoostAssetId);
    }

    protected getAssetFileLink(assetKey: string, asset: string): string {
        return `assets/boost/${asset}.png`;
    }

    constructor() {
        super(
            "Boost",
            {
                [BoostAssetId.HEAL]: "heal",
                [BoostAssetId.ARMOR]: "armor",
                [BoostAssetId.VERSATILE]: "versatile",
                [BoostAssetId.STRENGTH]: "strength",
                [BoostAssetId.PRECISION]: "precision",
                [BoostAssetId.LIFE]: "life",
                [BoostAssetId.VAMPIRE]: "vampire",
                [BoostAssetId.REACTION]: "reaction",
                [BoostAssetId.ENERGY]: "energy",
                [BoostAssetId.ACCELERATION]: "acceleration",
                [BoostAssetId.DODGE]: "dodge",
                [BoostAssetId.HEAVY_GUN]: "heavy_gun",
                [BoostAssetId.STABILISATION]: "stabilisation",
                [BoostAssetId.SPRINT]: "sprint",
                [BoostAssetId.ALLEVIATE]: "alleviate",
                [BoostAssetId.MASOCHISTIC]: "masochistic",
            },
            {
                [BoostAssetId.HEAL]: { width: 512, height: 512 },
                [BoostAssetId.ARMOR]: { width: 512, height: 512 },
                [BoostAssetId.VERSATILE]: { width: 512, height: 512 },
                [BoostAssetId.STRENGTH]: { width: 512, height: 512 },
                [BoostAssetId.PRECISION]: { width: 512, height: 512 },
                [BoostAssetId.LIFE]: { width: 512, height: 512 },
                [BoostAssetId.VAMPIRE]: { width: 512, height: 512 },
                [BoostAssetId.REACTION]: { width: 512, height: 512 },
                [BoostAssetId.ENERGY]: { width: 512, height: 512 },
                [BoostAssetId.ACCELERATION]: { width: 512, height: 512 },
                [BoostAssetId.DODGE]: { width: 512, height: 512 },
                [BoostAssetId.HEAVY_GUN]: { width: 512, height: 512 },
                [BoostAssetId.STABILISATION]: { width: 512, height: 512 },
                [BoostAssetId.SPRINT]: { width: 512, height: 512 },
                [BoostAssetId.ALLEVIATE]: { width: 512, height: 512 },
                [BoostAssetId.MASOCHISTIC]: { width: 512, height: 512 },
            },
        );
    }
}

export const BoostAsset = new BoostAssetManager();

