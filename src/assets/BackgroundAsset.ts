import { ImageAssetManager } from "../core/Assets/Asset";

export enum BackgroundAssetId {
    MAIN_MENU = "main_menu",
    LOBBY = "lobby",
    FIGHT = "fight",
}

class BackgroundAssetManager extends ImageAssetManager<
    BackgroundAssetId,
    string
> {
    protected getIds(): BackgroundAssetId[] {
        return Object.values(BackgroundAssetId);
    }

    protected getAssetFileLink(asset: string): string {
        return `assets/${asset}.png`;
    }

    constructor() {
        super("bkgd", {
            [BackgroundAssetId.MAIN_MENU]: "mainMenuBackGround",
            [BackgroundAssetId.LOBBY]: "red_bg",
            [BackgroundAssetId.FIGHT]: "red_bg",
        });
    }
}

export const BackgroundAsset = new BackgroundAssetManager();

