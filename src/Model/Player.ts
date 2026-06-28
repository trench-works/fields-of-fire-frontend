import { Boost } from "./Boost";

export type Player = {
    id: string;
    userId: string;
    entityId: string;
    gameId: string;
    name: string;
    invocation: string[],
    randomBoost: Boost[]
};

