import { Position } from "../core";
import { Effect } from "./Effect";
import { Stats } from "./Stats";

export enum EntityType {
    ALLY = "ALLY",
    ENEMY = "ENEMY",
    NEUTRAL = "NEUTRAL",
}

export type Entity = {
    entityId: string;
    classId: string;
    position: Position;
    entityType: EntityType;
    stats: Stats;
    effects: Effect[];
    dead: boolean;
};

