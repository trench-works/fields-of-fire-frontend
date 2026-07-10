import { Action } from "../../../Model/Action";

export class ActionsStore {
    selectedAction: Action | null;

    lockLevel: number;

    constructor() {
        this.selectedAction = null;
        this.lockLevel = 0;
    }
}

