import { Position } from "../../../core";
import { Action } from "../../../Model/Action";
import { FightScene } from "../fight.scene";

export class ActionManager {
    private _currentAction: Action | undefined;
    public scene!: FightScene;

    constructor(scene: FightScene) {
        this.scene = scene;
    }

    get currentAction(): Action | undefined {
        return this._currentAction;
    }

    set currentAction(action: Action | undefined) {

        console.log("Action sélectionnée :", action?.name || "Aucune");
        this._currentAction = action;
    }

    clearCurentAction() {
        this.currentAction = undefined;
    }

    launchAction(pos: Position) {
        console.log(`Lancement de l'action ${this._currentAction?.name} sur la position (${pos.x}, ${pos.y})`);
        this.scene.playerSocket.action({
            actionId: this._currentAction?.id || "",
            target: pos,
        });
        this.clearCurentAction();
    }
}
