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
        this._currentAction = action;

        this.scene.characters.forEach((character) => {
            if (action) {
                character.disableClick();
            } else {
                character.enableClick();
            }
        });
    }

    clearCurentAction() {
        this.currentAction = undefined; // ← passe par le setter, réactive les clics
    }

    launchAction(pos: Position) {
        this.scene.playerSocket.action({
            actionId: this._currentAction?.id || "",
            target: pos,
        });
        this.clearCurentAction();
    }
}
