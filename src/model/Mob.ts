import { Action } from "./Action";
import { Character } from "./Character";
import { Stats } from "./Stats";

export class Mob extends Character {
    constructor(
        id: string,
        name: string,
        sprite: string,
        actionList: Action[],
        stats: Stats,
        x: number,
        y: number,
        public mobType: string,
        public mobDesc: string
      ) {
        super(id, name, sprite, actionList, stats, x, y); // appelle le constructeur de Character
      }
}