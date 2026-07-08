import { Position } from "../../../core";
import { Action, ActionType } from "../../../Model/Action";
import { Entity } from "../../../Model/Entity";
import { Ran } from "../../../core/Types/Ran";
import { EffectAction } from "../../../Model/Effect";
import { PositionUtils } from "../../../core/Utils/Sizing";
import { StatsUtils } from "../../../Model/Stats";
import { ActionDisplayer } from "../display/action.displayer";
import { GamePlayerSocket } from "../repositories/player.socket";

export class ActionsService {
    public currentAction: Action | undefined;

    constructor(
        private readonly actions: ActionDisplayer,
        private readonly playerSocket: GamePlayerSocket,
    ) {}

    lock() {
        if (this.lockLevel === 0) {
            this.actions.actionElements.forEach((action) => {
                action.setIsActivated(false);
            });
            this.endTurnButton.setIsActivated(false);
        }
        this.lockLevel++;
    }

    unlock() {
        if (this.lockLevel > 0) {
            this.lockLevel--;
            if (this.lockLevel === 0) {
                this.actions.update();
            }
        }
    }

    public clearCurrentAction() {
        this.currentAction = undefined;
        this.actions.actionElements.forEach((action) =>
            action.hightlight(false),
        );
    }

    async launchAction(pos: Position) {
        this.actions.lock();
        const action = this.currentAction;
        this.actions.clearAction();
        await this.playerSocket.action({
            actionId: action?.id ?? "",
            target: pos,
        });
    }

    calculateFinalDamage(
        damage: number,
        action: Action,
        attacker: Entity,
        defenser: Entity,
    ): { defenserDamage: number; attackerDamage: number } {
        const attackerStats = StatsUtils.fromEntity(attacker);
        const defenserStats = StatsUtils.fromEntity(defenser);

        let attackerDamage: number = 0;
        let defenserDamage: number;

        let statBonus: number = 0;
        // calculate stats bonus
        switch (action.actionType) {
            case ActionType.MELEE:
                {
                    statBonus += attackerStats.strength / 10;
                }
                break;
            case ActionType.RANGED:
                {
                    statBonus += attackerStats.precision / 10;
                }
                break;
        }

        let brutTotal: number;
        if (damage < 0) {
            brutTotal = damage - statBonus;
            defenserDamage = brutTotal;
            if (defenserStats.life - defenserDamage > defenserStats.maxLife) {
                defenserDamage = -(defenserStats.maxLife - defenserStats.life);
            }
        } else {
            brutTotal = damage + statBonus;
            defenserDamage = brutTotal * (100 / (100 + defenserStats.armor));

            //Crit Logik
            const critRoll = Ran.int(100);
            const critChanceBuff = attacker.effects.filter(
                (e) => e.action === EffectAction.CRIT_CHANCE,
            ).length;
            const critDammageBuff = attacker.effects.filter(
                (e) => e.action === EffectAction.CRIT_DAMMAGE,
            ).length;
            const critChance = 1 + critChanceBuff * 3;
            if (critRoll < critChance) {
                defenserDamage = defenserDamage * (2 + 0.25 * critDammageBuff);
            }
        }

        if (action.id === "shield_rush") {
            defenserDamage *=
                1 +
                (PositionUtils.distance(attacker.position, defenser.position) -
                    1) *
                    0.1;
        }

        // Vampire : vol de vie par stack
        //Masochiste: self-dammage
        if ((action.damage?.min ?? -1) >= 0) {
            // seulement sur les dégâts positifs, pas les heals
            const vampireStacks = attacker.effects.filter(
                (e) => e.action === EffectAction.VAMPIRISM,
            ).length;
            if (vampireStacks > 0) {
                const lifeSteal = (defenserDamage / 10) * vampireStacks;
                attackerDamage = -lifeSteal;
            }

            const masoStacks = attacker.effects.filter(
                (e) => e.action === EffectAction.MASOCHISTIC,
            ).length;
            if (masoStacks > 0) {
                const masoDamage = defenserDamage * (0.2 * masoStacks);
                attackerDamage =
                    (masoDamage / 2) * (100 / (100 + attackerStats.armor));
                defenserDamage += masoDamage;
            }

            const weaknessStacks = attacker.effects.filter(
                (e) => e.action === EffectAction.WEAKNESS,
            ).length;
            if (weaknessStacks > 0) {
                const weaknessDamage = defenserDamage * (0.2 * weaknessStacks);
                defenserDamage += weaknessDamage;
            }
        }

        return {
            attackerDamage: Math.ceil(attackerDamage),
            defenserDamage: Math.ceil(defenserDamage),
        };
    }
}

