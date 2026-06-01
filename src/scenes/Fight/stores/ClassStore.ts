import { CharacterClass } from "../../../Model/CharacterClass";

export class ClassStore {
    classes: CharacterClass[] = [];

    setClasses(classes: CharacterClass[]): this {
        this.classes = classes;
        return this;
    }
}

