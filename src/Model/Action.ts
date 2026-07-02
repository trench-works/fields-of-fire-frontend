import { ActionAssetId } from "../assets";
import { Position } from "../core";
import { Effect } from "./Effect";

export class Action {
    id!: ActionAssetId;
    name!: string;
    description?: string;
    damage?: { min: number; max: number };
    actionType!: ActionType;
    effectList?: Effect[];
    range!: { min: number; max: number };
    rangeType!: ActionZoneType;
    zoneType?: ActionZoneType;
    zoneSize?: number;
    mooveToTarget?: Position;
    pushValue?: number;
    cost!: number;
    isWalkAction?: boolean;
}

export enum ActionType {
    MELEE = "MELEE",
    RANGED = "RANGED",
    OTHER = "OTHER",
}

export enum ActionZoneType {
    DIAMOND = "DIAMOND",
    CIRCLE = "CIRCLE",
    PLUS = "PLUS",
    XCROSS = "XCROSS",
}

