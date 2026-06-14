import { SoundAssetManager } from "../core/Assets/Asset";

export enum MusicAssetId {
    MENU = "menu",
    FIGHT = "fight",
}

class MusicAssetManager extends SoundAssetManager<MusicAssetId, string> {
    protected getIds(): MusicAssetId[] {
        return Object.values(MusicAssetId);
    }

    protected getAssetFileLink(assetKey: string, asset: string): string {
        return `assets/${assetKey}/${asset}.mp3`;
    }

    constructor() {
        super("musics", {
            [MusicAssetId.MENU]: "lobby",
            [MusicAssetId.FIGHT]: "fight",
        });
    }
}

export const MusicAsset = new MusicAssetManager();

