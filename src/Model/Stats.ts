export interface StatProps {
    life: number;
    precision: number;
    strength: number;
    accuracy: number;
    initiative: number;
    dodging: number;
    energy: number;
    mouvement: number;
}

export class Stats{

    public life: number;
    public precision: number
    public strength: number;
    public accuracy: number;
    public initiative: number;
    public dodging: number;
    public energy: number;
    public mouvement: number;

    constructor(
        props : StatProps
    ){
        this.life = props.life;
        this.precision = props.precision;
        this.strength = props.strength;
        this.accuracy = props.accuracy;
        this.initiative = props.initiative;
        this.dodging = props.dodging;
        this.energy = props.energy;
        this.mouvement = props.mouvement;
    }

    addLife(life: number) {
        this.life+=life;
    }

    addPrecision(precision: number) {
        this.precision+=precision;
    }

    addStrengh(strengh: number) {
        this.strength+=strengh;
    }

    addAccuracy(accuracy: number) {
        this.accuracy+=accuracy;
    }

    addInitiative(initiative: number) {
        this.initiative+=initiative;
    }

    addEnergy(energy: number) {
        this.energy+=energy;
    }

    addMouvement(mouvement: number) {
        this.mouvement+=mouvement;
    }
}