import { ImageAssetManager } from "../core/Assets/Asset";

export enum BoostAssetId {
    HEAL= "heal",
    ARMOR = "armor",
    VERSATILE = "versatile",
    STRENGTH = "strength",
    PRECISION= "precision",
    LIFE = "life",
    VAMPIRE = "vampire",
    REACTION = "reaction",
    ENERGY = "energy",
    ACCELERATION = "acceleration",
    DODGE = "dodging"
}

class BoostAssetManager extends ImageAssetManager<BoostAssetId, string> {
    protected getIds(): BoostAssetId[] {
        return Object.values(BoostAssetId);
    }

    protected getAssetFileLink(assetKey: string, asset: string): string {
        return `assets/boost/${asset}.png`;
    }

    constructor() {
        super("Boost", {
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
            [BoostAssetId.DODGE]: "dodge"
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
            [BoostAssetId.ACCELERATION]:{ width: 512, height: 512 },
            [BoostAssetId.DODGE]: { width: 512, height: 512 },
        }
        );
    }
}

export const BoostAsset = new BoostAssetManager();

