import { Boost } from "../../../Model/Boost";

export class EndFightStore {
    public boostId: string | null;
    public boosts: Boost[];
    public isReady: boolean;

    constructor() {
        this.boostId = null;
        this.boosts = [];
        this.isReady = false;
    }
}

