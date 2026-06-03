import { Action } from "./Action";
import { Stats } from "./Stats";

export class CharacterClass {
    id!: string;
    name!: string;
    playable!: boolean;
    stats!: Stats;
    classDescription!: string;
    actionList!: Action[];
}

