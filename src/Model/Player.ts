import { Boost } from "./Boost";

export type PlayerStats = {
    kills: number;
    heal: number;
    damages: number;
    steps: number;
    sustained: number;
    shielded: number;
};

export type Player = {
    id: string;
    userId: string;
    entityId: string;
    gameId: string;
    teamId: string;
    name: string;
    invocation: string[];
    randomBoost: Boost[];
    stats: PlayerStats;
};

