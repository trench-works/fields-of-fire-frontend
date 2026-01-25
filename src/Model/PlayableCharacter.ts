import { Action } from "./Action";
import { Character } from "./character";
import { CharacterClass } from "./CharacterClass";
import { Stats } from "./Stats";

export class PlayableCharacter extends Character {
    constructor(
    id: string,
    name: string,
    sprite: string,
    actionList: Action[],
    stats: Stats,
    temporaryStats: Stats,
    x: number,
    y: number,
    public characterClass: CharacterClass 
  ) {
    super(id, name, sprite, actionList, stats, x, y); // appelle le constructeur de Character
  }

}
