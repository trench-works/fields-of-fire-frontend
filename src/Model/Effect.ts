import { Stats } from "./Stats";

export enum EffectType {
    POISON = "poison",
    APPLY = "apply",
}

export type Effect = {
    id: string;
    name: string;
    type: EffectType;
    duration: number;
    modifier: Stats;
    author?: string;
};

