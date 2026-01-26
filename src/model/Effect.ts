import { Stats } from './Stats';

export class Effect {
    constructor(
        public name: string,
        public duration: number,
        public statModification: Stats
    ){}

}