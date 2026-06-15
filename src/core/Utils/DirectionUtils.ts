import { Position } from "../Types";

export class DirectionUtils {
    public static getDirection(a: Position, b: Position): number {
        return (Math.atan2(b.x - a.x, b.y - a.y) * 180) / Math.PI;
    }
}

