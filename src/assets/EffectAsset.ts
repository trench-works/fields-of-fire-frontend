import { ImageAssetManager } from "../core/Assets/Asset";

export enum EffectAssetId {
    AMPUTATED = "amputated",
    INTIMIDATED = "intimidated",
    DOPED = "doped",
    CHARGE = "charge",
    FIGHTING_DRUG = "enhanced_drug",
    REACTION = "reaction",
    VAMPIRE = "vampire",
    PROVOKED = "provoked",
    ANGERED = "angered",
    MASOCHISTIC = "masochistic",
    CRIT_DAMMAGE = "crit_dammage",
    CRIT_CHANCE = "crit_chance",
    WEAKNESS = "weakness",
    BURNED = "burned",
    REVENGE = "revenge",
    BLEEDING = "bleeding",
    INFECTED = "infected",
    DIFFICULT_RECOVERY = "difficult_recovery",
    UNTREATABLE = "untreatable",
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
            [EffectAssetId.REACTION] : "reaction",
            [EffectAssetId.VAMPIRE] : "vampire",
            [EffectAssetId.PROVOKED] : "provok",
            [EffectAssetId.ANGERED] : "angered",
            [EffectAssetId.MASOCHISTIC] : "masochistic",
            [EffectAssetId.CRIT_DAMMAGE] : "crit_dammage",
            [EffectAssetId.CRIT_CHANCE] : "crit_chance",
            [EffectAssetId.WEAKNESS] : "weakness",
            [EffectAssetId.BURNED] : "burned",
            [EffectAssetId.REVENGE] : "revenge",
            [EffectAssetId.BLEEDING] : "bleeding",
            [EffectAssetId.INFECTED] : "infected",
            [EffectAssetId.DIFFICULT_RECOVERY] : "infected",
            [EffectAssetId.UNTREATABLE] : "untreatable",
        },
        {
            [EffectAssetId.AMPUTATED]: { width: 512, height: 512 },
            [EffectAssetId.INTIMIDATED]: { width: 512, height: 512 },
            [EffectAssetId.DOPED]: { width: 512, height: 512 },
            [EffectAssetId.CHARGE]: { width: 512, height: 512 },
            [EffectAssetId.FIGHTING_DRUG]: { width: 512, height: 512 },
            [EffectAssetId.REACTION] : { width: 512, height: 512 },
            [EffectAssetId.VAMPIRE] : { width: 512, height: 512 },
            [EffectAssetId.PROVOKED] : { width: 512, height: 512 },
            [EffectAssetId.ANGERED] : { width: 512, height: 512 },
            [EffectAssetId.MASOCHISTIC] : { width: 512, height: 512 },
            [EffectAssetId.CRIT_DAMMAGE] : { width: 512, height: 512 },
            [EffectAssetId.CRIT_CHANCE] : { width: 512, height: 512 },
            [EffectAssetId.WEAKNESS] : { width: 512, height: 512 },
            [EffectAssetId.BURNED] : { width: 512, height: 512 },
            [EffectAssetId.REVENGE] : { width: 447, height: 447 },
            [EffectAssetId.BLEEDING] : { width: 512, height: 512 },
            [EffectAssetId.INFECTED] : { width: 512, height: 512 },
            [EffectAssetId.DIFFICULT_RECOVERY] : { width: 512, height: 512 },
            [EffectAssetId.UNTREATABLE] : { width: 512, height: 512 },
        }
        );
    }
}

export const EffectAsset = new EffectAssetManager();

