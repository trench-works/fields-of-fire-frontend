import { ImageAssetManager } from "../core/Assets/Asset";

export enum ActionAssetId {
    WALK = "walk",
    SHOOT = "shoot",
    HEAL = "heal",
}

class ActionAssetManager extends ImageAssetManager<ActionAssetId, string> {
    protected getIds(): ActionAssetId[] {
        return Object.values(ActionAssetId);
    }

    protected getAssetFileLink(asset: string): string {
        return `assets/action/${asset}.png`;
    }

    constructor() {
        super("action", {
            [ActionAssetId.WALK]: "action_image_moove",
            [ActionAssetId.SHOOT]: "action_image_shoot",
            [ActionAssetId.HEAL]: "action_image_arrowup",
        });
    }
}

export const ActionAsset = new ActionAssetManager();

