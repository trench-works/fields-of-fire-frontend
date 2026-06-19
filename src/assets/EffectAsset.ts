import { ImageAssetManager } from "../core/Assets/Asset";

export enum EffectAssetId {
    AMPUTATED = "amputated",
    INTIMIDATED = "intimidated",
    DOPED = "doped",
    CHARGE = "charge",
    FIGHTING_DRUG = "enhanced_drug",
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
        },
        {
            [EffectAssetId.AMPUTATED]: { width: 512, height: 512 },
            [EffectAssetId.INTIMIDATED]: { width: 512, height: 512 },
            [EffectAssetId.DOPED]: { width: 512, height: 512 },
            [EffectAssetId.CHARGE]: { width: 512, height: 512 },
            [EffectAssetId.FIGHTING_DRUG]: { width: 512, height: 512 },
        }
        );
    }
}

export const EffectAsset = new EffectAssetManager();

