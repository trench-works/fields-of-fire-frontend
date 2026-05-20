import { Position } from "../core";
import { Case } from "./Case";

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
        characterClassId: string;
        position: Position;
    }[];
};

