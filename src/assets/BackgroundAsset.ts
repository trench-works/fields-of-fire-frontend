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

    protected getAssetFileLink(assetKey: string, asset: string): string {
        return `assets/${assetKey}/${asset}.png`;
    }

    constructor() {
        super(
            "bkgd",
            {
                [BackgroundAssetId.MAIN_MENU]: "mainMenuBackGround",
                [BackgroundAssetId.LOBBY]: "red_bg",
                [BackgroundAssetId.FIGHT]: "red_bg",
            },
            {
                [BackgroundAssetId.MAIN_MENU]: { width: 1, height: 1 },
                [BackgroundAssetId.LOBBY]: { width: 1, height: 1 },
                [BackgroundAssetId.FIGHT]: { width: 1, height: 1 },
            },
        );
    }
}

export const BackgroundAsset = new BackgroundAssetManager();

