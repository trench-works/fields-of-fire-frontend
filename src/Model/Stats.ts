export class Stats{
    constructor(
        public life : number,
        public precision: number,
        public strength: number,
        public accuracy: number,
        public initiative: number,
        public energy : number,
        public mouvement : number,
    ){}

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