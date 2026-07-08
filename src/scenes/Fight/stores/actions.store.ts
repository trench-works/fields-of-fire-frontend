import { ActionAssetId } from "../../../assets";

export class ActionsStore {
    selectedAction: ActionAssetId | null;

    protected lockLevel: number;

    constructor() {
        this.selectedAction = null;
        this.lockLevel = 0;
    }
}

