import { EffectAssetId } from "../assets/EffectAsset";
import { Stats } from "./Stats";

export enum EffectType {
    POISON = "POISON",
    APPLY = "APPLY",
    CONSUMABLE = "CONSUMABLE",
}

export enum EffectAction {
    VAMPIRISM = "VAMPIRISM",
    CRIT_DAMMAGE = "CRIT_DAMMAGE",
    CRIT_CHANCE = "CRIT_CHANCE",
    MASOCHISTIC = "MASOCHISTIC",
    WEAKNESS = "WEAKNESS",
    LUCKY_STRIKE = "LUCKY_STRIKE",
    NONE = "NONE",
}

export type Effect = {
    id: EffectAssetId;
    name: string;
    type: EffectType;
    duration: number | null;
    modifier: Stats;
    author?: string;
    description?: string;
    action: EffectAction;
};

