import { Case } from "./Case";
import { Entity } from "./Entity";
import { Player } from "./Player";

export type Game = {
    id: string;
    creatorId: string;
    plateau: Case[][];
    players: Player[];
    entities: Entity[];
    playerTurns: string[];
};

