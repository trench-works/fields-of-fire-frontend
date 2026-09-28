import { Action } from "../../../Model/Action";

export class ActionsStore {
    selectedAction: Action | null;

    lockLevel: number;

    public orderedActions: Action[];

    constructor() {
        this.selectedAction = null;
        this.lockLevel = 0;
        this.orderedActions = [];
    }
}

