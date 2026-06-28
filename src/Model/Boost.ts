import { BoostAssetId } from "../assets/BoostAsset";
import { Stats } from "./Stats";

export enum BoostType {
    AI = "AI",
    PLAYER = "PLAYER",
}

export type Boost = {
    id: BoostAssetId;
    name: string;
    effects: string[];
    boosts: Partial<Stats>[];
    probability: number;
    type: BoostType;
};

