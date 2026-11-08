import { Color } from "../../../config/ColorConfig";
import {
    ColorUtils,
    Depth,
    GRID_LEVELS_OFFSET,
    isDefined,
    Position,
} from "../../../core";
import { Diamond } from "../../../core/Objects/Diamond";
import { PositionUtils } from "../../../core/Utils/Sizing";
import { applyFovToRange, Case } from "../../../Model";
import { Action, ActionLevel, ActionZoneType } from "../../../Model/Action";
import { Cell, FightScene } from "../fight.scene";
import { ActionsStore } from "../stores/actions.store";
import { GameStore } from "../stores/game.store";
import { GridStore } from "../stores/grid.store";
import { PlayerStore } from "../stores/player.store";

export class RangeService {
    private cellsInRange: Cell[] = []; //TODO: bouger ca dans un displayer

    constructor(
        private readonly scene: FightScene,
        private readonly gameStore: GameStore,
        private readonly gridStore: GridStore,
        private readonly playerStore: PlayerStore,
        private readonly actionStore: ActionsStore,
    ) {}

    private highlightCell(
        cell: Cell,
        color: Color = Color.CLEAR_BLUE,
    ): Phaser.GameObjects.Graphics {
        const highlight = this.scene.add.graphics();
        highlight.fillStyle(ColorUtils.parseColor(color), 0.6);
        highlight.fillPoints(new Diamond(cell, cell.scale).points, true);
        highlight.setPosition(cell.position.x, cell.position.y);
        highlight.setDepth(
            Depth.getFromGridPosition(
                cell.index,
                GRID_LEVELS_OFFSET.HIGHTLIGHT_3,
            ),
        );
        return highlight;
    }

    showRange(): this {
        this.cleanRange();
        for (const cell of this.cellsInRange) {
            if (!cell) continue;
            let actionBlocked = false;
            const selectedAction = this.actionStore.selectedAction;
            if (selectedAction) {
                const tile = this.gameStore.getCell(cell.index);
                if (tile) {
                    const used =
                        this.playerStore.playerEntity.actionUses?.[
                            selectedAction.id
                        ]?.[tile.entityId] ?? 0;
                    if (used >= selectedAction.maxUsePerTarget) {
                        actionBlocked = true;
                    }
                }
            }
            cell.rangeHighlight = this.highlightCell(
                cell,
                actionBlocked ? Color.CLEAR_ORANGE : Color.CLEAR_BLUE,
            );
        }
        return this;
    }

    clearRange(): this {
        this.cleanRange();
        this.cellsInRange = [];
        return this;
    }

    cleanRange(): this {
        console.log("CLEAR RANGE");
        this.clearZonePreview();
        for (const cell of this.cellsInRange) {
            if (cell?.rangeHighlight) {
                cell.rangeHighlight.destroy();
                cell.rangeHighlight = undefined;
            }
        }
        return this;
    }

    calculateCellsInMoveRange(
        start: Position,
        range: number,
        action: Action,
    ): this {
        const inRangeCells: Map<string, Position> = new Map();

        const cellsAround = this.getCellsAround(start, 1, range, (cell) => {
            switch (action.level) {
                case ActionLevel.GROUND:
                    return !cell.isHole && !cell.isWall && !cell.entityId;
                case ActionLevel.UNDERGROUND:
                    return !cell.isHole;
                case ActionLevel.OVERGROUND:
                default:
                    return true;
            }
        });
        for (const cellInRange of cellsAround) {
            inRangeCells.set(`${cellInRange.x},${cellInRange.y}`, cellInRange);
        }
        this.cellsInRange = Array.from(inRangeCells.values())
            .map(this.gridStore.get)
            .filter(isDefined);
        return this;
    }

    private getCellsAround(
        pos: Position,
        explorationI: number,
        maxRange: number,
        exploreCell: (cell: Case) => boolean,
    ): Position[] {
        if (explorationI > maxRange) {
            return [];
        }
        const cells: Position[] = [];
        for (let x = pos.x - 1; x <= pos.x + 1; x++) {
            for (let y = pos.y - 1; y <= pos.y + 1; y++) {
                if (x === pos.x || y === pos.y) {
                    const pos = { x, y };
                    const cell = this.gameStore.getCell(pos);
                    if (cell && exploreCell(cell)) {
                        cells.push(
                            pos,
                            ...this.getCellsAround(
                                pos,
                                explorationI + 1,
                                maxRange,
                                exploreCell,
                            ),
                        );
                    }
                }
            }
        }
        return cells;
    }

    calculateCellsInAttackRange(start: Position, action: Action): this {
        const result: Cell[] = [];
        const board = this.gameStore.game.plateau;

        this.gridStore.forEach(({ index: { x, y } }) => {
            let isInRange = false;
            const cell = this.gameStore.getCell({ x, y });
            const dist = Math.abs(start.x - x) + Math.abs(start.y - y);

            switch (action.rangeType) {
                case ActionZoneType.DIAMOND:
                case ActionZoneType.CIRCLE:
                    if (
                        dist <= action.range.max &&
                        dist >= action.range.min &&
                        cell &&
                        !cell.isHole &&
                        !cell.isWall
                    ) {
                        isInRange = true;
                    }
                    break;
                case ActionZoneType.PLUS:
                    if (
                        dist <= action.range.max &&
                        dist >= action.range.min &&
                        cell &&
                        !cell.isHole &&
                        !cell.isWall
                    ) {
                        if (x === start.x || y === start.y) {
                            isInRange = true;
                        }
                    }
                    break;
                case ActionZoneType.XCROSS: {
                    const dx = Math.abs(start.x - x);
                    const dy = Math.abs(start.y - y);
                    if (
                        cell &&
                        !cell.isHole &&
                        !cell.isWall &&
                        dx === dy &&
                        dx >= action.range.min &&
                        dx <= action.range.max
                    ) {
                        isInRange = true;
                    }
                    break;
                }
            }
            if (isInRange) {
                const cell = this.gridStore.get({ x, y });
                if (cell) {
                    result.push(cell);
                }
            }
        });

        if (action.level === ActionLevel.GROUND) {
            this.cellsInRange = applyFovToRange(
                start,
                result,
                board,
                action.range.max,
            );
            return this;
        }
        this.cellsInRange = result;
        return this;
    }

    isInRange(pos: Position): boolean {
        return this.cellsInRange
            .filter(Boolean)
            .some(({ index }) => PositionUtils.equals(pos, index));
    }

    clearZonePreview() {
        this.gridStore.forEach((cell) => {
            cell.spellHighlight?.destroy();
            cell.spellHighlight = undefined;
        });
    }

    setZoneHighlight(cell: Cell) {
        cell.spellHighlight = this.highlightCell(cell, Color.CLEAR_GREEN);
    }

    getSpellZonePreview(action: Action, target: Position) {
        this.clearZonePreview();
        const zoneCells: Cell[] = [];

        if (!this.isInRange(target)) return;
        if (!action.zoneType?.length) return;
        if (!action.zoneSize) return;
        switch (action.zoneType[0]) {
            case ActionZoneType.DIAMOND: {
                const zoneSize = action.zoneSize - 1;
                for (
                    let x = target.x - zoneSize;
                    x <= target.x + zoneSize;
                    x++
                ) {
                    for (
                        let y = target.y - zoneSize;
                        y <= target.y + zoneSize;
                        y++
                    ) {
                        const pos = { x, y };
                        if (
                            Math.abs(target.x - x) + Math.abs(target.y - y) <=
                            zoneSize
                        ) {
                            const cell = this.gridStore.get(pos);
                            const boardCell = this.gameStore.getCell(pos);
                            if (
                                cell &&
                                !boardCell?.isHole &&
                                !boardCell?.isWall
                            ) {
                                this.setZoneHighlight(cell);
                                zoneCells.push(cell);
                            }
                        }
                    }
                }
                break;
            }
            case ActionZoneType.CONE: {
                const origin = this.playerStore.playerEntity.position;
                this.gridStore.forEach(({ index }) => {
                    if (!this.isInCone(origin, target, index, action.zoneSize!)) return;
                    const cell = this.gridStore.get(index);
                    const boardCell = this.gameStore.getCell(index);
                    if (cell && !boardCell?.isHole && !boardCell?.isWall) {
                        this.setZoneHighlight(cell);
                        zoneCells.push(cell);
                    }
                });
                break;
            }
        }

        return zoneCells;
    }

    isInCone(
        origin: Position,
        target: Position,
        position: Position,
        size: number,
    ): boolean {
        const dx = target.x - origin.x;
        const dy = target.y - origin.y;
        if (dx === 0 && dy === 0) return false;

        const horizontal = Math.abs(dx) >= Math.abs(dy);
        const sign = horizontal ? Math.sign(dx) : Math.sign(dy);

        const depth = horizontal
            ? (position.x - target.x) * sign
            : (position.y - target.y) * sign;
        const lateral = horizontal
            ? Math.abs(position.y - target.y)
            : Math.abs(position.x - target.x);

        return depth >= 0 && depth <= size - 1 && lateral <= depth;
    }
}

