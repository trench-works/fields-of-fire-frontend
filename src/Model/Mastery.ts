import { Action } from "./Action";

export type SimpleRequirement = { masteryId: string; level: number };
export type AnyOfRequirement = { anyOf: SimpleRequirement[] };
export type MasteryRequirement = SimpleRequirement | AnyOfRequirement;

export type Mastery = {
    id: string;
    name: string;
    description?: string;
    maxLevel: number;
    statsPerLevel?: Record<string, number>;
    passive?: string;
    masteringPointsRequired?: number;
    masteryRequirements?: MasteryRequirement[];
    exclusiveWith?: string[];
    subMasteries?: Mastery[];
    newActions?: Action[]; 
};

export type MasteryTree = {
    id: string;
    classId: string;
    rootMastery?: Mastery;
    masteries: Mastery[]; // les branches
};

export type MasterySelection = Record<string, number>;