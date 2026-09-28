import { CharacterClass } from "../../../Model/CharacterClass";
import { Entity } from "../../../Model/Entity";

export class StatsStore {
    public entity: Entity | undefined;
    public characterClass: CharacterClass | undefined;
    public name: string | undefined;
    public show: boolean;

    get entityId() {
        return this.entity?.id;
    }

    get isShow() {
        return this.show;
    }

    constructor() {
        this.entity = undefined;
        this.characterClass = undefined;
        this.name = undefined;
        this.show = true;
    }
}

