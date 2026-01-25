import { Action } from "./Action";
import { Stats } from "./Stats";

export class CharacterClass {
    constructor(
        name: string,
        sprite : string,
        stats: Stats,
        classDescription : string,
        actionList: Action[],
    ) {}
}