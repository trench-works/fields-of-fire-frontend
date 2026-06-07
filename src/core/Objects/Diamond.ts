export class Diamond extends Phaser.Geom.Polygon {
    constructor(tile: Phaser.Tilemaps.Tile, scaleFactor: number) {
        super([
            //point1 (left corner)
            0 - 32 * scaleFactor,
            (-tile.height * scaleFactor) / 4,
            //point2 (top corner)
            0,
            (-tile.height * scaleFactor) / 2,
            //point3 (right corner)
            (tile.width * scaleFactor) / 2,
            0 - 16 * scaleFactor,
            //point4 (bottom corner)
            0,
            0,
        ]);
    }
}

