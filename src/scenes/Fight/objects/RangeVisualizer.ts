import { Cell, GameScene, Position } from "../../../core";

export class RangeVisualizer{

    public scene : GameScene;
    

    constructor(scene : GameScene){
        this.scene = scene;
    }

    highlightCell(cell: Cell) {
        const g = this.scene.add.graphics();
        g.fillStyle(0x00aaff, 0.6); // bleu transparent
        g.fillPoints(
            [
            new Phaser.Geom.Point(-32 * this.scene.scaleFactor, 0 * this.scene.scaleFactor),
            new Phaser.Geom.Point(0, -16 * this.scene.scaleFactor),
            new Phaser.Geom.Point(32 * this.scene.scaleFactor, 0 * this.scene.scaleFactor),
            new Phaser.Geom.Point(0, 16 * this.scene.scaleFactor),
            ],
            true
        );

        g.setPosition(cell.pixelPosition.x, cell.pixelPosition.y);
        g.setDepth(2);

        // On stocke l’overlay pour pouvoir le retirer plus tard
        (cell as any).highlight = g;
    }

    showRange(cells: Cell[]) {
        cells.forEach(cell => this.highlightCell(cell));
    }

    clearRange() {
        for (const row of this.scene.gridPositions) {
            for (const cell of row) {
                if ((cell as any).highlight) {
                    (cell as any).highlight.destroy();
                    delete (cell as any).highlight;
                }
            }
        }
    }

    getCellsInRange(center: Position, range: number): Cell[] {
        const result: Cell[] = [];

        for (let y = 0; y < this.scene.gridPositions.length; y++) {
            for (let x = 0; x < this.scene.gridPositions[y].length; x++) {
                const dist = Math.abs(center.x - x) + Math.abs(center.y - y);
                if (dist <= range) {
                    result.push(this.scene.gridPositions[y][x]);
                }
            }
        }

        return result;
    }


    onActionSelected(origin : Position, range : number | undefined) {
    this.clearRange();

    if (!range){
        console.log("this action don't have any range");
        return
    }
    const cells = this.getCellsInRange(origin, range);

    this.showRange(cells);
}

}