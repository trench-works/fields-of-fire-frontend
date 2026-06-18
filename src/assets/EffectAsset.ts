import { ImageAssetManager } from "../core/Assets/Asset";

export enum EffectAssetId {
    AMPUTATED = "amputated",
    INTIMIDATED = "intimidated",
    DOPED = "doped",
    CHARGE = "charge",
    FIGHTING_DRUG = "enhanced_drug",
    HEAL_UP = "healUpBoost",
    ARMOR = "armorBoost",
    VERSATILE = "versatileBoost",
    STRENGTH = "strenghtBoost",
    PRECISION= "precisionBoost",
    LIFE = "lifeBoost",
    VAMPIRE = "vampireBoost",
    RANGE = "rangeBoost",
    REACTION = "reactionBoost",
    ENERGY = "energyBoost",
    MOUVEMENT = "mouvementBoost",
    DODGING = "dodgingBoost"
}

class EffectAssetManager extends ImageAssetManager<EffectAssetId, string> {
    protected getIds(): EffectAssetId[] {
        return Object.values(EffectAssetId);
    }

    protected getAssetFileLink(assetKey: string, asset: string): string {
        return `assets/action/icons/${asset}.png`;
    }

    constructor() {
        super("effect", {
            [EffectAssetId.AMPUTATED]: "amputate",
            [EffectAssetId.INTIMIDATED]: "intimidation",
            [EffectAssetId.DOPED]: "dopage",
            [EffectAssetId.CHARGE]: "charge",
            [EffectAssetId.FIGHTING_DRUG] : "enhanced_drug",
            [EffectAssetId.VERSATILE]: "versatileBoost",
            [EffectAssetId.HEAL_UP] : "healUpBoost",
            [EffectAssetId.VAMPIRE] : "vampireBoost",
        },
        {
            [EffectAssetId.AMPUTATED]: { width: 512, height: 512 },
            [EffectAssetId.INTIMIDATED]: { width: 512, height: 512 },
            [EffectAssetId.DOPED]: { width: 512, height: 512 },
            [EffectAssetId.CHARGE]: { width: 512, height: 512 },
            [EffectAssetId.FIGHTING_DRUG]: { width: 512, height: 512 },
            [EffectAssetId.HEAL_UP]: { width: 512, height: 512 },
            [EffectAssetId.ARMOR]: { width: 512, height: 512 },
            [EffectAssetId.VERSATILE]: { width: 512, height: 512 },
            [EffectAssetId.STRENGTH]: { width: 512, height: 512 },
            [EffectAssetId.PRECISION]: { width: 512, height: 512 },
            [EffectAssetId.LIFE]: { width: 512, height: 512 },
            [EffectAssetId.VAMPIRE]: { width: 512, height: 512 },
            [EffectAssetId.RANGE]: { width: 512, height: 512 },
            [EffectAssetId.REACTION]: { width: 512, height: 512 },
            [EffectAssetId.ENERGY]: { width: 512, height: 512 },
            [EffectAssetId.MOUVEMENT]:{ width: 512, height: 512 },
            [EffectAssetId.DODGING]: { width: 512, height: 512 },
        }
        );
    }
}

export const EffectAsset = new EffectAssetManager();

