import { ImageAssetManager } from "../core/Assets/Asset";

export enum EffectAssetId {
    AMPUTATED = "amputated",
    INTIMIDATED = "intimidated",
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
        },
        {
            [EffectAssetId.AMPUTATED]: {width : 512, height: 512},
            [EffectAssetId.INTIMIDATED]: {width : 512, height: 512},
        }
        );
    }
}

export const EffectAsset = new EffectAssetManager();

