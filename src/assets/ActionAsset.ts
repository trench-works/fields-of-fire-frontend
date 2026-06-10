import { ImageAssetManager } from "../core/Assets/Asset";

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

class ActionAssetManager extends ImageAssetManager<ActionAssetId, string> {
    protected getIds(): ActionAssetId[] {
        return Object.values(ActionAssetId);
    }

    protected getAssetFileLink(assetKey: string, asset: string): string {
        return `assets/action/icons/${asset}.png`;
    }

    constructor() {
        super("action", {
            [ActionAssetId.WALK]: "walk",
            [ActionAssetId.SHOOT]: "shoot",
            [ActionAssetId.HEAL]: "heal",
            [ActionAssetId.ARTILLERY_SUPPORT]: "artillery_support",
            [ActionAssetId.AMPUTATE]: "amputate",
            [ActionAssetId.BAYONET]: "bayonet",
            [ActionAssetId.INTIMIDATION]: "intimidation",
            [ActionAssetId.SNEAKY]: "sneaky",
        });
    }
}

export const ActionAsset = new ActionAssetManager();

class ActionAnimationAssetManager extends ImageAssetManager<
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
        super("action_animation", {
            [ActionAssetId.WALK]: "walk",
            [ActionAssetId.SHOOT]: "shoot",
            [ActionAssetId.HEAL]: "heal",
            [ActionAssetId.ARTILLERY_SUPPORT]: "artillery_support",
            [ActionAssetId.AMPUTATE]: "amputate",
            [ActionAssetId.BAYONET]: "bayonet",
            [ActionAssetId.INTIMIDATION]: "intimidation",
            [ActionAssetId.SNEAKY]: "sneaky",
        });
    }
}

export const ActionAnimationAsset = new ActionAnimationAssetManager();

