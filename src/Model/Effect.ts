import { EffectAssetId } from "../assets/EffectAsset";
import { Stats } from "./Stats";

export enum EffectType {
    POISON = "POISON",
    APPLY = "APPLY",
}

export type Effect = {
    id: EffectAssetId;
    name: string;
    type: EffectType;
    duration: number | null;
    modifier: Stats;
    author?: string;
    description?: string
};

