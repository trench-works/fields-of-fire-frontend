import { Position } from "../core";
import { Effect } from "./Effect";

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
    effects: Effect[];
};

