import { ActionAssetId } from "../assets";
import { Position } from "../core";
import { Effect } from "./Effect";

export enum ActionLevel {
    UNDERGROUND = "UNDERGROUND",
    GROUND = "GROUND",
    OVERGROUND = "OVERGROUND",
}

export class Action {
    id!: ActionAssetId;
    name!: string;
    description?: string;
    damage?: { min: number; max: number };
    effectList?: ManagedEffect[];
    rangeType!: ActionZoneType;
    range!: { min: number; max: number };
    actionType!: ActionType;
    zoneType?: ActionZoneType;
    zoneSize?: number;
    //mooveToTarget?: Position;
    //pushValue?: number;
    cost!: number;
    //isWalkAction?: boolean;
    targetRequired?: boolean;
    invocateClass?: string;
    maxUsePerTarget!: number;
    maxUsePerRound!: number
    level!: ActionLevel;
}
export class ManagedEffect {
    effect!: Effect;
    chanceToApply?: number;
    target!: EffectTarget;
    onHit?: boolean;
}

export enum EffectTarget {
    SELF = "SELF",
    TARGET = "TARGET",
    RANDOM_ALLY = "RANDOM_ALLY",
    RANDOM_FOE = "RANDOM_FOE",
    ALL_ALLY = "ALL_ALLY",
    ALL_FOE = "ALL_FOE",
    ALL = "ALL"
}

export enum ActionType {
    RANGED = "RANGED",
    MELEE = "MELEE",
    MOUVEMENT = "MOUVEMENT",
    SUPPORT = "SUPPORT",
    OTHER = "OTHER",
}

export enum ActionZoneType {
    DIAMOND = "DIAMOND",
    CIRCLE = "CIRCLE",
    PLUS = "PLUS",
    XCROSS = "XCROSS",
    CONE = "CONE"
}

