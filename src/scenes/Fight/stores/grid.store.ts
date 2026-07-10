import { Cell } from "../fight.scene";

export class GridStore {
    public groundLayer: Phaser.Tilemaps.TilemapLayer | null;
    public gridPositions: Cell[][] = [];

    constructor() {
        this.groundLayer = null;
    }

    setGroundLayer(groundLayer: Phaser.Tilemaps.TilemapLayer | null) {
        this.groundLayer = groundLayer;
    }

    setGridPositions(gridPositions: Cell[][]) {
        this.gridPositions = gridPositions;
    }
}

