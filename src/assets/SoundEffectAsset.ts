import { SoundAssetManager } from "../core/Assets/Asset";

export enum SoundEffectAssetId {
    DEATH = "death",
    HURT = "hurt",
    AMPUTATE = "amputate",
    VICTORY = "victory",
    CANNON = "cannon",
    SHOT = "shot",
    INTIMIDATION = "intimidation",
    CHARGE = "charge",
    DOPAGE = "dopage",
    SABER = "saber",
    HAMMER = "hammer",
    SHIELD_IMPACT = "shield-impact",
    BATTLE_AXE = "battle-axe",
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
                [SoundEffectAssetId.CHARGE]: "charge",
                [SoundEffectAssetId.DOPAGE]: "dopage",
                [SoundEffectAssetId.SABER]: "saber",
                [SoundEffectAssetId.HAMMER]: "hammer",
                [SoundEffectAssetId.SHIELD_IMPACT]: "shield-impact",
                [SoundEffectAssetId.BATTLE_AXE]: "battle-axe",
            },
            {
                [SoundEffectAssetId.DEATH]: 1,
                [SoundEffectAssetId.HURT]: 3,
                [SoundEffectAssetId.AMPUTATE]: 1,
                [SoundEffectAssetId.VICTORY]: 1,
                [SoundEffectAssetId.CANNON]: 1,
                [SoundEffectAssetId.SHOT]: 1,
                [SoundEffectAssetId.INTIMIDATION]: 1,
                [SoundEffectAssetId.CHARGE]: 1,
                [SoundEffectAssetId.DOPAGE]: 1,
                [SoundEffectAssetId.SABER]: 1,
                [SoundEffectAssetId.HAMMER]: 1,
                [SoundEffectAssetId.SHIELD_IMPACT]: 1,
                [SoundEffectAssetId.BATTLE_AXE]: 0.5,
            },
        );
    }
}

export const SoundEffectAsset = new SoundEffectAssetManager();

