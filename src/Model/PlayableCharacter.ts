import { Character, CharactersProps } from "./Character";
import { CharacterClass } from "./CharacterClass";

export type PlayableCharacterProps = CharactersProps & {
    characterClass: CharacterClass;
};

export class PlayableCharacter extends Character {
    constructor(
        characterProps: CharactersProps,

        public characterClass: CharacterClass
    ) {
        super(characterProps);
        this.baseStats = characterClass.stats;
        this.spriteKey = characterClass.spriteKey;
        this.iconImageKey = characterClass.iconImageKey;
        this.characterClass = characterClass;
    }
}

