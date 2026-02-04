import { Character, CharactersProps } from "./Character";

export type MobProps = CharactersProps & {
    mobType: string;
    mobDesc: string;
};

export class Mob extends Character {
    constructor(
        characterProps: CharactersProps,
        public mobType: string,
        public mobDesc: string
      ) {
        super(characterProps);

        this.mobType = mobType;
        this.mobDesc = mobDesc;
      }
}