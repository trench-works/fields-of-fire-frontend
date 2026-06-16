import { Position } from "../../../core";
import { Action, ActionZoneType } from "../../../Model/Action";
import { Cell, FightScene } from "../fight.scene";
import { GameStore } from "../stores/GameStore";

export class RangeVisualizer {
    private cellsInRange: Cell[] = [];
    private zoneHighlights: Phaser.GameObjects.Graphics[] = [];

    constructor(
        private readonly scene: FightScene,
        private readonly gameStore: GameStore,
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
        g.setPosition(cell.pixelPosition.x, cell.pixelPosition.y);
        g.setDepth(2);
        return g; // ✅ ne stocke plus sur cell.highlight ici
    }

    showRange(): this {
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

    getCellsInMoveRange(start: Position, range: number): this {
        //TODO: this one will avoid walls, holes and entity
        const inRangeCells: Map<string, Position> = new Map();

        const cellsAround = this.getCellsAround(start, 1, range);
        for (const cellInRange of cellsAround) {
            inRangeCells.set(`${cellInRange.x},${cellInRange.y}`, cellInRange);
        }
        this.cellsInRange = Array.from(inRangeCells.values()).map(
            ({ x, y }) => this.scene.gridPositions[x]?.[y],
        );
        return this;
    }

    private getCellsAround(
        pos: Position,
        explorationI: number,
        maxRange: number,
    ): Position[] {
        if (explorationI > maxRange) {
            return [];
        }
        const board = this.gameStore.game.plateau;
        const cells: Position[] = [];
        for (let x = pos.x - 1; x <= pos.x + 1; x++) {
            for (let y = pos.y - 1; y <= pos.y + 1; y++) {
                if (x === pos.x || y === pos.y) {
                    const cell = board[x]?.[y];
                    if (
                        cell &&
                        !cell.isHole &&
                        !cell.isWall &&
                        !cell.entityId
                    ) {
                        const cellPos = { x, y };
                        cells.push(
                            cellPos,
                            ...this.getCellsAround(
                                cellPos,
                                explorationI + 1,
                                maxRange,
                            ),
                        );
                    }
                }
            }
        }
        return cells;
    }

    getCellsInAttackRange(start: Position, range: number): this {
        //TODO: this one will avoid only walls and is directional
        /**
         * 1 - determinate forbidden angles ranges on distance like -> "cant shoot from angle 185 to 190 starting from 30 pixel away"
         */
        const result: Cell[] = [];
        const board = this.gameStore.game.plateau;

        for (let x = 0; x < this.scene.gridPositions.length; x++) {
            for (let y = 0; y < this.scene.gridPositions[x].length; y++) {
                const cell = board[x]?.[y];
                const dist = Math.abs(start.x - x) + Math.abs(start.y - y);
                if (dist <= range && cell && !cell.isHole && !cell.isWall) {
                    result.push(this.scene.gridPositions[x]?.[y]);
                }
            }
        }
        this.cellsInRange = result;

        return this;
    }

    isInRange({ x, y }: Position): boolean {
        return this.cellsInRange
            .filter(Boolean)
            .some(
                ({ gridPosition }) =>
                    gridPosition.x === x && gridPosition.y === y,
            );
    }

    clearZonePreview() {
        this.zoneHighlights.forEach((g) => g.destroy());
        this.zoneHighlights = [];
    }

    spellZonePreview(action: Action, target: Position) {
        this.clearZonePreview(); // ✅ nettoie avant de redessiner
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
                        if (
                            Math.abs(target.x - x) + Math.abs(target.y - y) <=
                            zoneSize
                        ) {
                            const cell = this.scene.gridPositions[x]?.[y];
                            const boardCell =
                                this.gameStore.game.plateau[x]?.[y];
                            if (
                                cell &&
                                !boardCell.isHole &&
                                !boardCell.isWall
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

