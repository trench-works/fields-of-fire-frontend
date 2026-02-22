import { Action } from "./Action";
import { Stats } from "./Stats";

export class CharacterClass {
    constructor(
        public name: string,
        public imageKey: string,
        public spriteKey: string,
        public iconImageKey: string,
        public stats: Stats,
        public classDescription: string,
        public actionList: Action[]
    ) {}
}

