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
    MASOCHISTIC = "masochistic"
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
        }
        );
    }
}

export const EffectAsset = new EffectAssetManager();

