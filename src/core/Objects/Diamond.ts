import { Tile, TILE_SIZE } from "../UI/TileLayer";

export class Diamond extends Phaser.Geom.Polygon {
    constructor(tile: Tile, scaleFactor: number) {
        super([
            //point1 (left corner)
            0 - (TILE_SIZE.height / 2) * scaleFactor,
            -tile.height / 4,
            //point2 (top corner)
            0,
            -tile.height / 2,
            //point3 (right corner)
            tile.width / 2,
            0 - (TILE_SIZE.height / 4) * scaleFactor,
            //point4 (bottom corner)
            0,
            0,
        ]);
    }
}

