import { Position } from "../../../core";
import { Action, ActionType } from "../../../Model/Action";
import { Entity } from "../../../Model/Entity";
import { FightScene } from "../fight.scene";
import { StatsUtils } from "../../../Model/Stats";
import { Ran } from "../../../core/Types/Ran";
import { EffectAction } from "../../../Model/Effect";

export class ActionManager {
    public currentAction: Action | undefined;
    public scene!: FightScene;

    constructor(scene: FightScene) {
        this.scene = scene;
    }

    public clearCurrentAction() {
        this.currentAction = undefined;
    }

    async launchAction(pos: Position) {
        this.scene.actions.lock();
        const action = this.currentAction;
        this.scene.actions.clearAction();
        await this.scene.playerSocket.action({
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
                    statBonus += Math.ceil(attackerStats.strength / 10);
                }
                break;
            case ActionType.RANGED:
                {
                    statBonus += Math.ceil(attackerStats.precision / 10);
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
            defenserDamage = Math.ceil(
                brutTotal * (100 / (100 + defenserStats.armor)),
            );

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
                defenserDamage = Math.ceil(
                    defenserDamage * (2 + 0.25 * critDammageBuff),
                );
            }
        }

        // Vampire : vol de vie par stack
        //Masochiste: self-dammage
        if ((action.damage?.min ?? -1) >= 0) {
            // seulement sur les dégâts positifs, pas les heals
            const vampireStacks = attacker.effects.filter(
                (e) => e.action === EffectAction.VAMPIRISM,
            ).length;
            if (vampireStacks > 0) {
                const lifeSteal =
                    Math.ceil(defenserDamage / 10) * vampireStacks;
                attackerDamage = -lifeSteal;
            }

            const masoStacks = attacker.effects.filter(
                (e) => e.action === EffectAction.MASOCHISTIC,
            ).length;
            if (masoStacks > 0) {
                const masoDamage = Math.floor(
                    defenserDamage * (0.2 * masoStacks),
                );
                attackerDamage = Math.ceil(
                    Math.floor(masoDamage / 2) *
                        (100 / (100 + attackerStats.armor)),
                );
                defenserDamage += masoDamage;
            }

            const weaknessStacks = attacker.effects.filter(
                (e) => e.action === EffectAction.WEAKNESS,
            ).length;
            if (weaknessStacks > 0) {
                const weaknessDamage = Math.floor(
                    defenserDamage * (0.2 * weaknessStacks),
                );
                defenserDamage += weaknessDamage;
            }
        }

        return { attackerDamage, defenserDamage };
    }
}

