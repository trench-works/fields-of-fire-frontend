import { Position } from "../core";
import { Effect } from "./Effect";

export class Action {
    id!: string;
    name!: string;
    description?: string;
    damage?: { min: number; max: number };
    actionType!: ActionType;
    effectList?: Effect[];
    range?: number;
    zoneType?: string;
    zoneSize?: number;
    mooveToTarget?: Position;
    pushValue?: number;
    cost!: number;
    isWalkAction?: boolean;
}

export enum ActionType {
    MELEE = "MELEE",
    RANGED = "RANGED"
}

