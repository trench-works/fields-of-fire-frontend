import { Depth, GRID_LEVELS_OFFSET, isDefined, Position } from "../../../core";
import { PositionUtils } from "../../../core/Utils/Sizing";
import { applyFovToRange, Case } from "../../../Model";
import { Action, ActionLevel, ActionZoneType } from "../../../Model/Action";
import { Cell, FightScene } from "../fight.scene";
import { GameStore } from "../stores/game.store";
import { GridStore } from "../stores/grid.store";

export class RangeService {
    private cellsInRange: Cell[] = [];
    private zoneHighlights: Phaser.GameObjects.Graphics[] = [];

    constructor(
        private readonly scene: FightScene,
        private readonly gameStore: GameStore,
        private readonly gridStore: GridStore,
    ) {}

    private highlightCell(
        cell: Cell,
        color: number = 0x00aaff,
    ): Phaser.GameObjects.Graphics {
        const g = this.scene.add.graphics();
        g.fillStyle(color, 0.6);
        g.fillPoints(
            [
                new Phaser.Geom.Point(-32 * this.scene.scaleFactor, 0),
                new Phaser.Geom.Point(0, -16 * this.scene.scaleFactor),
                new Phaser.Geom.Point(32 * this.scene.scaleFactor, 0),
                new Phaser.Geom.Point(0, 16 * this.scene.scaleFactor),
            ],
            true,
        );
        g.setPosition(cell.position.x, cell.position.y - cell.height / 4);
        g.setDepth(
            Depth.getFromGridPosition(
                cell.index,
                GRID_LEVELS_OFFSET.HIGHTLIGHT_3,
            ),
        );
        return g;
    }

    showRange(): this {
        this.clearRange();
        this.cellsInRange.forEach((cell) => {
            if (cell) {
                cell.highlight = this.highlightCell(cell);
            }
        });
        return this;
    }

    clearRange(): this {
        this.clearZonePreview();
        for (const cell of this.cellsInRange) {
            if (cell?.highlight) {
                cell.highlight.destroy();
                delete cell.highlight;
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

        console.log("typeof actionRange is ", action.rangeType);

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
            this.cellsInRange = applyFovToRange(start, result, board);
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
        this.zoneHighlights.forEach((g) => g.destroy());
        this.zoneHighlights = [];
    }

    getSpellZonePreview(action: Action, target: Position) {
        this.clearZonePreview();
        const zoneCells: Cell[] = [];

        if (!this.isInRange(target)) return;
        if (!action.zoneType?.length) return;
        switch (action.zoneType[0]) {
            case ActionZoneType.DIAMOND: {
                if (!action.zoneSize) return;
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
                                this.zoneHighlights.push(
                                    this.highlightCell(cell, 0x42a97b),
                                );
                                zoneCells.push(cell);
                            }
                        }
                    }
                }
                break;
            }
        }

        return zoneCells;
    }
}

