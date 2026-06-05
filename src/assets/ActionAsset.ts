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
        return `assets/${assetKey}/${asset}.png`;
    }

    constructor() {
        super("action", {
            [ActionAssetId.WALK]: "action_image_moove",
            [ActionAssetId.SHOOT]: "action_image_shoot",
            [ActionAssetId.HEAL]: "action_image_heal",
            [ActionAssetId.ARTILLERY_SUPPORT]: "action_image_artillerySupport",
            [ActionAssetId.AMPUTATE]: "action_image_amputate",
            [ActionAssetId.BAYONET]: "action_image_bayonet",
            [ActionAssetId.INTIMIDATION]: "action_image_intimidation",
            [ActionAssetId.SNEAKY]: "action_image_sneaky",
        });
    }
}

export const ActionAsset = new ActionAssetManager();

