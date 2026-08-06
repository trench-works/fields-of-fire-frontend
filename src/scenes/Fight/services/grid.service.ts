import { Position } from "../../../core";
import { StatsUtils } from "../../../Model/Stats";
import { BoardDisplayer } from "../display/board.displayer";
import { CharactersDisplayer } from "../display/characters.displayer";
import { FightScene } from "../fight.scene";
import { ActionsService } from "../services/actions.service";
import { RangeService } from "../services/range.service";
import { ActionsStore } from "../stores/actions.store";
import { ClassStore } from "../stores/class.store";
import { GameStore } from "../stores/game.store";
import { GridStore } from "../stores/grid.store";
import { PlayerStore } from "../stores/player.store";
import { InspectCharacterService } from "./inspect-character.service";

export class GridService {
    constructor(
        // Scene
        private readonly scene: FightScene,
        // Stores
        private readonly gameStore: GameStore,
        private readonly groundStore: GridStore,
        private readonly classStore: ClassStore,
        private readonly playerStore: PlayerStore,
        private readonly actionStore: ActionsStore,
        // Services
        private readonly actionService: ActionsService,
        private readonly rangeService: RangeService,
        private readonly inspectService: InspectCharacterService,
        // Displayers
        private readonly characterDisplayer: CharactersDisplayer,
        private readonly boardDisplayer: BoardDisplayer,
    ) {
        window.addEventListener("wheel", (event) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const direction = Math.sign((event as any)["wheelDelta"]);
            if (direction === 1) {
                this.groundStore.groundLayer?.zoomIn(this.scene.scaleFactor);
            } else {
                this.groundStore.groundLayer?.zoomOut(this.scene.scaleFactor);
            }
            this.characterDisplayer.scale();
            this.boardDisplayer.scale();
        });
    }

    cellClick({ x, y }: Position) {
        this.characterDisplayer.changeDirection({ x, y });
        if (this.actionStore.selectedAction) {
            if (this.rangeService.isInRange({ x, y })) {
                this.actionService.launchAction({ x, y });
            }
        } else {
            const tile = this.gameStore.game.plateau[x][y];
            if (tile.entityId) {
                this.inspectService.inspectCharacter(tile.entityId);
            }
        }
        this.rangeService.clearRange();
        this.actionService.clearAction();
    }

    cellHover(pos: Position) {
        const cell = this.groundStore.get(pos);
        const boardCell = this.gameStore.getCell(pos);
        if (cell && boardCell) {
            cell.hoverGraphics?.setVisible(true);
            if (boardCell.entityId) {
                const entity = this.gameStore.getEntity(boardCell.entityId);

                if (!this.actionStore.selectedAction) {
                    this.scene.tooltip.showNow(
                        this.classStore.getClass(entity.classId).name,
                        `❤️ ${StatsUtils.fromEntity(entity).life} PV`,
                        {
                            x: cell.position.x,
                            y: cell.position.y - 140 * this.scene.scaleFactor,
                        },
                    );
                }
            }
            if (this.actionStore.selectedAction) {
                this.manageToolTip(pos.x, pos.y);
            }
        }
    }

    cellHoverOut(pos: Position) {
        const cell = this.groundStore.get(pos);
        cell?.hoverGraphics?.setVisible(false);
        this.scene.tooltip.hide();
        this.rangeService.clearZonePreview();
    }

    clearHover() {
        this.scene.tooltip.hide();
    }

    manageToolTip(x: number, y: number) {
        const action = this.actionStore.selectedAction;
        if (!action) return;

        const zoneCells = this.rangeService.getSpellZonePreview(action, {
            x,
            y,
        });
        if (!zoneCells || action.id === "walk") return;

        // ✅ collecte tous les tooltips à afficher
        const tooltipItems: {
            text: string;
            title?: string;
            position: { x: number; y: number };
        }[] = [];

        zoneCells.forEach((cell) => {
            const entityId = this.gameStore.getCell(cell.index)?.entityId;
            if (!entityId) return;

            const targetEntity = this.gameStore.getEntity(entityId);
            if (!targetEntity) return;

            const minDamage = this.actionService.calculateFinalDamage(
                action.damage?.min ?? 0,
                action,
                this.playerStore.playerEntity,
                targetEntity,
            );
            const maxDamage = this.actionService.calculateFinalDamage(
                action.damage?.max ?? 0,
                action,
                this.playerStore.playerEntity,
                targetEntity,
            );

            const isHeal = (action.damage?.max ?? 0) <= 0;

            tooltipItems.push({
                text: `${isHeal ? "🩹" : "⚔️"} ${isHeal ? -minDamage.defenserDamage : minDamage.defenserDamage}-${isHeal ? -maxDamage.defenserDamage : maxDamage.defenserDamage}`,
                title: this.classStore.getClass(targetEntity.classId).name,
                position: {
                    x: cell.position.x,
                    y: cell.position.y - 130 * cell.scale,
                },
            });
        });

        this.scene.tooltip.showFightingTooltip(tooltipItems);
    }
}

