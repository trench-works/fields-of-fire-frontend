import { Position } from "../../../core";
import { TileLayer } from "../../../core/UI/TileLayer";
import { Cell } from "../fight.scene";

export class GridStore {
    public groundLayer: TileLayer<Cell> | undefined;
    public hover: Position | undefined;

    constructor() {
        this.groundLayer = undefined;
        this.hover = undefined;
    }

    get = (pos: Position): Cell | undefined => {
        return this.groundLayer?.getTile(pos);
    };

    forEach = (forEach: (cell: Cell) => void) => {
        this.groundLayer?.tiles.flat().forEach(forEach);
    };

    setGroundLayer(groundLayer: TileLayer<Cell>) {
        this.groundLayer = groundLayer;
    }
}

