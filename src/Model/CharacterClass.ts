import { CharacterAssetId } from "../assets";
import { Action } from "./Action";
import { Stats } from "./Stats";

export class CharacterClass {
    id!: CharacterAssetId;
    name!: string;
    playable!: boolean;
    stats!: Stats;
    classDescription!: string;
    actionList!: Action[];
}

