import { Cell, GameScene, Position } from "../../../core";

export class RangeVisualizer {
    public scene: GameScene;

    constructor(scene: GameScene) {
        this.scene = scene;
    }

    highlightCell(cell: Cell) {
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

    showRange(cells: Cell[]) {
        cells.forEach((cell) => {
            if (cell) {
                this.highlightCell(cell);
            }
        });
    }

    clearRange() {
        for (const row of this.scene.gridPositions) {
            for (const cell of row) {
                if ((cell as any)?.highlight) {
                    (cell as any).highlight.destroy();
                    delete (cell as any).highlight;
                }
            }
        }
    }

    getCellsInRange(center: Position, range: number, notSelf: boolean): Cell[] {
        const result: Cell[] = [];

        for (let x = 0; x < this.scene.gridPositions.length; x++) {
            for (let y = 0; y < this.scene.gridPositions[x].length; y++) {
                const dist = Math.abs(center.x - x) + Math.abs(center.y - y);
                if (
                    dist <= range &&
                    (notSelf === false || !(x === center.x && y === center.y))
                ) {
                    result.push(this.scene.gridPositions[x][y]);
                }
            }
        }

        return result;
    }

    onActionSelected(
        origin: Position,
        range: number | undefined,
        notSelf: boolean = false,
    ) {
        this.clearRange();

        if (!range && range !== 0) {
            console.log("this action don't have any range");
            return;
        }

        const cells = this.getCellsInRange(origin, range, notSelf);

        this.showRange(cells);
    }

    isItInRange(origin: Position, range: number, target: Position): boolean {
        const dist =
            Math.abs(origin.x - target.x) + Math.abs(origin.y - target.y);

        return dist <= range;
    }
}

