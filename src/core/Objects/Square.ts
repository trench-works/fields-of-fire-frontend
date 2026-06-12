import { Position, Size } from "../Types";

export class Square extends Phaser.Geom.Polygon {
    constructor({ x, y, width, height }: Size & Position) {
        super([
            //point1 (upper left corner)
            x,
            y,
            //point2 (upper right corner)
            x + width,
            y,
            //point3 (bottom right corner)
            x + width,
            y + height,
            //point4 (bottom left corner)
            x,
            y + height,
        ]);
    }
}

