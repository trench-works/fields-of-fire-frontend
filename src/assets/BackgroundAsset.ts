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
    getIds(): BackgroundAssetId[] {
        return Object.values(BackgroundAssetId);
    }

    getAssetFileLink(asset: string): string {
        return `assets/${asset}.png`;
    }

    constructor() {
        super(
            {
                [BackgroundAssetId.MAIN_MENU]: "mainMenuBackGround",
                [BackgroundAssetId.LOBBY]: "red_bg",
                [BackgroundAssetId.FIGHT]: "red_bg",
            },
            {
                [BackgroundAssetId.MAIN_MENU]: "bkgd_main_menu",
                [BackgroundAssetId.LOBBY]: "bkgd_lobby",
                [BackgroundAssetId.FIGHT]: "bkgd_fight",
            }
        );
    }
}

export const BackgroundAsset = new BackgroundAssetManager();

