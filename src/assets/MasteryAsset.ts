import { ImageAssetManager } from "../core/Assets/Asset";

export enum MasteryAssetId {
    UNKNOWN = "unknown",
}

const MasteryAssetEntries = Object.fromEntries(
    Object.values(MasteryAssetId).map((v) => [v, v]),
) as Record<MasteryAssetId, string>;

class MasteryAssetManager extends ImageAssetManager<MasteryAssetId, string> {
    protected getIds(): MasteryAssetId[] {
        return Object.values(MasteryAssetId);
    }
    protected getAssetFileLink(assetKey: string, asset: string): string {
        return `assets/mastery/icons/${asset}.png`;
    }
    constructor() {
        super("mastery", MasteryAssetEntries, {
            [MasteryAssetId.UNKNOWN]: { width: 1, height: 1 },
        });
    }
}

export const MasteryAsset = new MasteryAssetManager();

export function getMasteryImageKey(masteryId: string): string {
    const known = Object.values(MasteryAssetId).includes(masteryId as MasteryAssetId);
    return MasteryAsset.getAssetKey(known ? (masteryId as MasteryAssetId) : MasteryAssetId.UNKNOWN);
}