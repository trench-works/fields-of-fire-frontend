import { ImageAssetManager, SpriteAssetManager } from "../core/Assets/Asset";

export enum ActionAssetId {
    WALK = "walk",
    SHOOT = "shoot",
    HEAL = "heal",
    ARTILLERY_SUPPORT = "artillery_support",
    AMPUTATE = "amputate",
    BAYONET = "bayonet",
    INTIMIDATION = "intimidation",
    SNEAKY = "sneaky",
}

const ActionAssetEntries = Object.fromEntries(
    Object.values(ActionAssetId).map((value) => [value, value]),
) as Record<ActionAssetId, string>;

class ActionAssetManager extends ImageAssetManager<ActionAssetId, string> {
    protected getIds(): ActionAssetId[] {
        return Object.values(ActionAssetId);
    }

    protected getAssetFileLink(assetKey: string, asset: string): string {
        return `assets/action/icons/${asset}.png`;
    }

    constructor() {
        super(
            "action",
            { ActionAssetEntries },
            {
                [ActionAssetId.WALK]: { width: 1, height: 1 },
                [ActionAssetId.SHOOT]: { width: 1, height: 1 },
                [ActionAssetId.HEAL]: { width: 1, height: 1 },
                [ActionAssetId.ARTILLERY_SUPPORT]: { width: 1, height: 1 },
                [ActionAssetId.AMPUTATE]: { width: 1, height: 1 },
                [ActionAssetId.BAYONET]: { width: 1, height: 1 },
                [ActionAssetId.INTIMIDATION]: { width: 1, height: 1 },
                [ActionAssetId.SNEAKY]: { width: 1, height: 1 },
            },
        );
    }
}

export const ActionAsset = new ActionAssetManager();

class ActionAnimationAssetManager extends SpriteAssetManager<
    ActionAssetId,
    string
> {
    protected getIds(): ActionAssetId[] {
        return Object.values(ActionAssetId);
    }

    protected getAssetFileLink(assetKey: string, asset: string): string {
        return `assets/action/animation/${asset}.png`;
    }

    constructor() {
        super(
            "action_animation",
            {
                [ActionAssetId.ARTILLERY_SUPPORT]:
                    ActionAssetId.ARTILLERY_SUPPORT,
                [ActionAssetId.INTIMIDATION]: ActionAssetId.INTIMIDATION,
            },
            {
                [ActionAssetId.ARTILLERY_SUPPORT]: {
                    frameWidth: 128,
                    frameHeight: 160,
                    frameTime: [500, 500, 500, 500, 500, 500, 500, 500, 500],
                },
                [ActionAssetId.INTIMIDATION]: {
                    frameWidth: 192,
                    frameHeight: 192,
                    frameTime: [250, 250, 250, 500, 500, 500],
                },
            },
        );
    }
}

export const ActionAnimationAsset = new ActionAnimationAssetManager();

