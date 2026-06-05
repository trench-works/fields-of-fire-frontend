import { Position } from "../../../core";
import { Action, ActionType } from "../../../Model/Action";
import { Entity } from "../../../Model/Entity";
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
    }

    clearCurentAction() {
        this.currentAction = undefined;
    }

    launchAction(pos: Position) {
        this.scene.playerSocket.action({
            actionId: this._currentAction?.id || "",
            target: pos,
        });
        this.clearCurentAction();
    }

    calculateDamage(action: Action, attacker: Entity, target: Entity): number {
        const damageRange = action.damage!.max - action.damage!.min + 1;
        const randomDamage =
            Math.floor(Math.random() * damageRange) + action.damage!.min;

        const statBonus =
            action.actionType === ActionType.MELEE
                ? Math.ceil(attacker.stats!.strength / 10)
                : Math.ceil(attacker.stats!.precision / 10);

        const brutTotal = randomDamage + statBonus;
        const reduction = Math.ceil(brutTotal * (target.stats!.armor / 100));

        console.log(`Calculated : ${brutTotal - reduction} dammage`);

        return brutTotal - reduction;
    }
}

