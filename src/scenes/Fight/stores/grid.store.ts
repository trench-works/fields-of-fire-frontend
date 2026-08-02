import { Position } from "../../../core";
import { TileLayer } from "../../../core/UI/TileLayer";
import { Cell } from "../fight.scene";

export class GridStore {
    public groundLayer: TileLayer | null;
    public gridPositions: Cell[][] = [];

    constructor() {
        this.groundLayer = null;
    }

    get = ({ x, y }: Position): Cell | undefined => {
        return this.gridPositions?.[x]?.[y];
    };

    setGroundLayer(groundLayer: TileLayer | null) {
        this.groundLayer = groundLayer;
    }

    setGridPositions(gridPositions: Cell[][]) {
        this.gridPositions = gridPositions;
    }
}

