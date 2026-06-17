import { EffectAssetId } from "../assets/EffectAsset";
import { Stats } from "./Stats";

export enum EffectType {
    POISON = "poison",
    APPLY = "apply",
}

export type Effect = {
    id: EffectAssetId;
    name: string;
    type: EffectType;
    duration: number | null;
    modifier: Stats;
    author?: string;
};

