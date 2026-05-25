import { Stats } from "./Stats";

export type Effect = {
    name: string;
    duration: number;
    statModification: Stats;
};
