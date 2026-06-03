import { ImageAssetManager } from "../core/Assets/Asset";

export enum ParticleAssetId {
    BOOST = "boost",
    DEBUFF = "debuff",
    HEAL = "heal",
}

class ParticleAssetManager extends ImageAssetManager<ParticleAssetId, string> {
    protected getIds(): ParticleAssetId[] {
        return Object.values(ParticleAssetId);
    }

    protected getAssetFileLink(assetKey: string, asset: string): string {
        return `assets/${assetKey}/${asset}.png`;
    }

    constructor() {
        super("particle", {
            [ParticleAssetId.BOOST]: "boost_particle",
            [ParticleAssetId.DEBUFF]: "debuff_particle",
            [ParticleAssetId.HEAL]: "heal_particle",
        });
    }
}

export const ParticleAsset = new ParticleAssetManager();

