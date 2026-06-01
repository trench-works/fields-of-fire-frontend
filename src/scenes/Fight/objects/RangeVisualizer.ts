import { Position } from "../../../core";
import { Cell, FightScene } from "../fight.scene";
import { GameStore } from "../stores/GameStore";

export class RangeVisualizer {
    private cellsInRange: Cell[] = [];

    constructor(
        private readonly scene: FightScene,
        private readonly gameStore: GameStore,
    ) {}

    private highlightCell(cell: Cell) {
        const g = this.scene.add.graphics();
        g.fillStyle(0x00aaff, 0.6); // bleu transparent
        g.fillPoints(
            [
                new Phaser.Geom.Point(
                    -32 * this.scene.scaleFactor,
                    0 * this.scene.scaleFactor,
                ),
                new Phaser.Geom.Point(0, -16 * this.scene.scaleFactor),
                new Phaser.Geom.Point(
                    32 * this.scene.scaleFactor,
                    0 * this.scene.scaleFactor,
                ),
                new Phaser.Geom.Point(0, 16 * this.scene.scaleFactor),
            ],
            true,
        );

        g.setPosition(cell.pixelPosition.x, cell.pixelPosition.y);
        g.setDepth(2);

        // On stocke l’overlay pour pouvoir le retirer plus tard
        (cell as any).highlight = g;
    }

    showRange(): this {
        this.cellsInRange.forEach((cell) => {
            if (cell) {
                this.highlightCell(cell);
            }
        });
        return this;
    }

    clearRange(): this {
        for (const cell of this.cellsInRange) {
            if ((cell as any)?.highlight) {
                (cell as any).highlight.destroy();
                delete (cell as any).highlight;
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
                        const cellPos = new Position(x, y);
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

        for (let x = 0; x < this.scene.gridPositions.length; x++) {
            for (let y = 0; y < this.scene.gridPositions[x].length; y++) {
                const dist = Math.abs(start.x - x) + Math.abs(start.y - y);
                if (dist <= range && !(x === start.x && y === start.y)) {
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
}

