import { Position } from "../core";
import { Effect } from "./Effect";

export class Action {
    id!: string;
    name!: string;
    description?: string;
    dammage?: number;
    effectList?: Effect[];
    range?: number;
    zoneType?: string;
    zoneSize?: number;
    mooveToTarget?: Position;
    pushValue?: number;
    cost!: number;
    isWalkAction?: boolean;
}

