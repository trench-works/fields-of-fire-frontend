import { Position } from "../../../core";
import { Action, ActionType } from "../../../Model/Action";
import { Entity } from "../../../Model/Entity";
import { FightScene } from "../fight.scene";
import { StatsUtils } from "../../../Model/Stats";

export class ActionManager {
    public currentAction: Action | undefined;
    public scene!: FightScene;

    constructor(scene: FightScene) {
        this.scene = scene;
    }

    public clearCurrentAction() {
        this.currentAction = undefined;
    }

    launchAction(pos: Position) {
        this.scene.playerSocket.action({
            actionId: this.currentAction?.id || "",
            target: pos,
        });
        this.clearCurrentAction();
    }

    calculateDamagePreview(
        action: Action,
        attacker: Entity,
        target: Entity,
    ): [number, number] {
        const attackerStats = StatsUtils.fromEntity(attacker);
        const targetStats = StatsUtils.fromEntity(target);
        if (!action.damage) {
            return [0, 0];
        }
        const statBonus =
            action.actionType === ActionType.MELEE
                ? Math.ceil(attackerStats.strength / 10)
                : Math.ceil(attackerStats.precision / 10);

        const minBrut = action.damage.min + statBonus;
        const maxBrut = action.damage.max + statBonus;

        return [
            minBrut - Math.ceil(minBrut * minBrut > 0 ? targetStats!.armor / 100 : 0),
            maxBrut - Math.ceil(maxBrut * maxBrut > 0 ? targetStats!.armor / 100 : 0),
        ];
    }
}

