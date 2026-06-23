import { Case } from "./Case";
import { Entity } from "./Entity";
import { Player } from "./Player";
import { Team } from "./Team";

export enum GameMode {
    INFINITY = "INFINITY",
    PVP = "PVP",
}

export type Game = {
    id: string;
    mode: GameMode;
    creatorId: string;
    plateau: Case[][];

    // Entities related things
    players: Player[];
    entities: Entity[];
    teams: Team[];

    playerTurns: string[];
    readyPlayers: string[];

    //things relative to rounds
    isStopped: boolean;
};

