import { SpriteAssetManager } from "../core/Assets/Asset";

export enum MiscAnimationId {
    BLOOD_SPLATTER = "blood",
}

class MiscAnimationAssetManager extends SpriteAssetManager<
    MiscAnimationId,
    string
> {
    protected getIds(): MiscAnimationId[] {
        return Object.values(MiscAnimationId);
    }

    protected getAssetFileLink(assetKey: string, asset: string): string {
        return `assets/misc/animations/${asset}.png`;
    }

    constructor() {
        super(
            "misc_animation",
            {
                [MiscAnimationId.BLOOD_SPLATTER]: "blood_splatter",
            },
            {
                [MiscAnimationId.BLOOD_SPLATTER]: {
                    frameWidth: 512,
                    frameHeight: 512,
                    frameTime: [
                        40, 40, 40, 40, 40, 30, 30, 30, 30, 20, 20, 20, 20, 20,
                        10, 10,
                    ],
                },
            },
        );
    }
}

export const MiscAnimationAsset = new MiscAnimationAssetManager();

