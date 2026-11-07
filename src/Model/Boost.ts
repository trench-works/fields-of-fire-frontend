import { BoostAssetId } from "../assets/BoostAsset";
import { EffectAssetId } from "../assets/EffectAsset";
import { Stats } from "./Stats";

export enum BoostType {
    AI = "AI",
    PLAYER = "PLAYER",
}

export type Boost = {
    id: BoostAssetId;
    name: string;
    effects: EffectAssetId[];
    boosts: Partial<Stats>[];
    probability: number;
    type: BoostType;
};

