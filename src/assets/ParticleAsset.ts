import { ImageAssetManager } from "../core/Assets/Asset";

export enum ParticleAssetId {
    BOOST = "boost",
    DEBUFF = "debuff",
    HEAL = "heal",
    SMOKE = "smoke",
    DUST = "dust",
    EMBER = "ember",
}

class ParticleAssetManager extends ImageAssetManager<ParticleAssetId, string> {
    protected getIds(): ParticleAssetId[] {
        return Object.values(ParticleAssetId);
    }

    protected getAssetFileLink(assetKey: string, asset: string): string {
        return `assets/${assetKey}/${asset}.png`;
    }

    constructor() {
        super(
            "particle",
            {
                [ParticleAssetId.BOOST]: "boost",
                [ParticleAssetId.DEBUFF]: "debuff",
                [ParticleAssetId.HEAL]: "heal",
                [ParticleAssetId.SMOKE]: "smoke",
                [ParticleAssetId.DUST]: "dust",
                [ParticleAssetId.EMBER]: "ember",
            },
            {
                [ParticleAssetId.BOOST]: { width: 1, height: 1 },
                [ParticleAssetId.DEBUFF]: { width: 1, height: 1 },
                [ParticleAssetId.HEAL]: { width: 1, height: 1 },
                [ParticleAssetId.SMOKE]: { width: 1, height: 1 },
                [ParticleAssetId.DUST]: { width: 1, height: 1 },
                [ParticleAssetId.EMBER]: { width: 1, height: 1 },
            },
        );
    }
}

export const ParticleAsset = new ParticleAssetManager();

