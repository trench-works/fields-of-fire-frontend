import { Position } from "../core";
import { Case } from "./Case";

export enum EntityType {
    ALLY = "ALLY",
    ENEMY = "ENEMY",
    NEUTRAL = "NEUTRAL",
}

export type Game = {
    id: string;
    plateau: Case[][];
    players: {
        playerId: string;
        userId: string;
        entityId: string;
        gameId: string;
    }[];
    entities: {
        entityId: string;
        classId: string;
        position: Position;
        entityType: EntityType;
    }[];
};

