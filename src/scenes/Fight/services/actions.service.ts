import { KeyBindUtils, Position } from "../../../core";
import { Action, ActionType } from "../../../Model/Action";
import { Entity } from "../../../Model/Entity";
import { Ran } from "../../../core/Types/Ran";
import { EffectAction } from "../../../Model/Effect";
import { PositionUtils } from "../../../core/Utils/Sizing";
import { StatsUtils } from "../../../Model/Stats";
import { ActionDisplayer } from "../display/action.displayer";
import { PlayerStore } from "../stores/player.store";
import { ActionsStore } from "../stores/actions.store";
import { ActionAssetId } from "../../../assets";
import { RangeService } from "./range.service";
import { ActionRepository } from "../repositories/action.repository";
import { KeyBind, KeyBinds } from "../../../core/keybinds/keybinds";

export class ActionsService {
    public keyBinds: KeyBinds;

    constructor(
        // Stores
        private readonly playerStore: PlayerStore,
        private readonly actionStore: ActionsStore,
        // Repository
        private readonly actionRepository: ActionRepository,
        // Services
        private readonly rangeService: RangeService,
        // Displayer
        private readonly actions: ActionDisplayer,
    ) {
        this.keyBinds = KeyBindUtils.getKeyBinds();
        window.addEventListener("keydown", (event) =>
            this.handleKeyClick(event),
        );
    }

    lock() {
        if (this.actionStore.lockLevel === 0) {
            this.actions.actionElements.forEach((action) => {
                action.setIsActivated(false);
            });
            this.actions.endTurnButton.setIsActivated(false);
        }
        this.actionStore.lockLevel++;
    }

    unlock() {
        if (this.actionStore.lockLevel > 0) {
            this.actionStore.lockLevel--;
            if (this.actionStore.lockLevel === 0) {
                this.actions.update();
            }
        }
    }

    clearAction() {
        this.actionStore.selectedAction = null;
        this.rangeService.clearRange();
        this.rangeService.clearZonePreview();
        this.actions.clearCurrentAction();
    }

    handleKeyClick(event: KeyboardEvent) {
        const binds = this.keyBinds;
        switch (event.code) {
            case binds[KeyBind.ONE]:
                event.preventDefault();
                this.handleActionKey(0);
                break;
            case binds[KeyBind.TWO]:
                event.preventDefault();
                this.handleActionKey(1);
                break;
            case binds[KeyBind.THREE]:
                event.preventDefault();
                this.handleActionKey(2);
                break;
            case binds[KeyBind.FOUR]:
                event.preventDefault();
                this.handleActionKey(3);
                break;
            case binds[KeyBind.FIVE]:
                event.preventDefault();
                this.handleActionKey(4);
                break;
            case binds[KeyBind.SIX]:
                event.preventDefault();
                this.handleActionKey(5);
                break;
            case binds[KeyBind.SEVEN]:
                event.preventDefault();
                this.handleActionKey(6);
                break;
            case binds[KeyBind.EIGHT]:
                event.preventDefault();
                this.handleActionKey(7);
                break;
            case binds[KeyBind.NINE]:
                event.preventDefault();
                this.handleActionKey(8);
                break;
            case binds[KeyBind.ZERO]:
                event.preventDefault();
                this.handleActionKey(9);
                break;
        }
    }

    handleActionKey(index: number) {
        const action = this.actions.orderedActions[index];
        if (
            action &&
            !this.actionStore.lockLevel &&
            !this.actionStore.selectedAction
        ) {
            this.handleActionSelection(action);
        } else {
            this.clearAction();
        }
    }

    handleActionClick(action: Action) {
        if (!this.actionStore.lockLevel && !this.actionStore.selectedAction) {
            this.handleActionSelection(action);
        } else {
            this.clearAction();
        }
    }

    async launchAction(pos: Position) {
        console.log(pos);
        this.lock();
        const action = this.actionStore.selectedAction;
        this.clearAction();
        await this.actionRepository.action({
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

    finishTurn() {
        this.actionRepository.finishTurn();
        this.rangeService.clearRange();
        this.rangeService.clearZonePreview();
    }

    handleActionSelection(action: Action) {
        const stats = StatsUtils.fromEntity(this.playerStore.playerEntity);
        this.clearAction();
        this.actionStore.selectedAction = action;
        switch (action.id) {
            case ActionAssetId.WALK:
                if (!stats.mouvement) {
                    return;
                }
                this.rangeService.calculateCellsInMoveRange(
                    this.playerStore.playerEntity.position,
                    stats.mouvement,
                    action,
                );
                break;
            default:
                if (stats.energy < action.cost) {
                    return;
                }
                this.rangeService.calculateCellsInAttackRange(
                    this.playerStore.playerEntity.position,
                    action,
                );
                break;
        }

        this.rangeService.showRange();
        this.actions.actionElements.get(action.id)?.hightlight(true);
    }
}

