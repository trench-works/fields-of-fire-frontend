import { CharacterClass } from "../../../Model/CharacterClass";
import { Entity } from "../../../Model/Entity";

export enum EffectPanel {
    EFFECTS = "EFFECTS",
    BOOSTS = "BOOSTS",
}

export class StatsStore {
    public entity: Entity | undefined;
    public characterClass: CharacterClass | undefined;
    public name: string | undefined;
    public show: boolean;
    public effectPanel: EffectPanel;

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
        this.effectPanel = EffectPanel.EFFECTS;
    }
}

