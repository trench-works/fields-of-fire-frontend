import { Position } from "../../../core";
import { Cell } from "../fight.scene";

export class GridStore {
    public groundLayer: Phaser.Tilemaps.TilemapLayer | null;
    public gridPositions: Cell[][] = [];

    constructor() {
        this.groundLayer = null;
    }

    get = ({ x, y }: Position): Cell | undefined => {
        return this.gridPositions?.[x]?.[y];
    };

    setGroundLayer(groundLayer: Phaser.Tilemaps.TilemapLayer | null) {
        this.groundLayer = groundLayer;
    }

    setGridPositions(gridPositions: Cell[][]) {
        this.gridPositions = gridPositions;
    }
}

