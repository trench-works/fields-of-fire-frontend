import { SoundAssetManager } from "../core/Assets/Asset";

export enum SoundEffectAssetId {
    DEATH = "death",
    HURT = "hurt",
    AMPUTATE = "amputate",
    VICTORY = "victory",
    CANNON = "cannon",
    SHOT = "shot",
    INTIMIDATION = "intimidation",
}

class SoundEffectAssetManager extends SoundAssetManager<
    SoundEffectAssetId,
    string
> {
    protected getIds(): SoundEffectAssetId[] {
        return Object.values(SoundEffectAssetId);
    }

    protected getAssetFileLink(assetKey: string, asset: string): string {
        return `assets/sound-effects/${asset}.mp3`;
    }

    constructor() {
        super(
            "sound_effect",
            {
                [SoundEffectAssetId.DEATH]: "death",
                [SoundEffectAssetId.HURT]: "hurt",
                [SoundEffectAssetId.AMPUTATE]: "amputate",
                [SoundEffectAssetId.VICTORY]: "victory",
                [SoundEffectAssetId.CANNON]: "cannon",
                [SoundEffectAssetId.SHOT]: "shot",
                [SoundEffectAssetId.INTIMIDATION]: "intimidation",
            },
            {
                [SoundEffectAssetId.DEATH]: 1,
                [SoundEffectAssetId.HURT]: 3,
                [SoundEffectAssetId.AMPUTATE]: 1,
                [SoundEffectAssetId.VICTORY]: 1,
                [SoundEffectAssetId.CANNON]: 1,
                [SoundEffectAssetId.SHOT]: 1,
                [SoundEffectAssetId.INTIMIDATION]: 1,
            },
        );
    }
}

export const SoundEffectAsset = new SoundEffectAssetManager();

