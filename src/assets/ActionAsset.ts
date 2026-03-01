import { ImageAssetManager } from "../core/Assets/Asset";

export enum ActionAssetId {
    WALK = "walk",
    SHOOT = "shoot",
    HEAL = "heal",
}

class ActionAssetManager extends ImageAssetManager<ActionAssetId, string> {
    getIds(): ActionAssetId[] {
        return Object.values(ActionAssetId);
    }

    getAssetFileLink(asset: string): string {
        return `assets/action/${asset}.png`;
    }

    constructor() {
        super(
            {
                [ActionAssetId.WALK]: "action_image_moove",
                [ActionAssetId.SHOOT]: "action_image_shoot",
                [ActionAssetId.HEAL]: "action_image_arrowup",
            },
            {
                [ActionAssetId.WALK]: "action_walk",
                [ActionAssetId.SHOOT]: "action_shoot",
                [ActionAssetId.HEAL]: "action_heal",
            }
        );
    }
}

export const ActionAsset = new ActionAssetManager();

