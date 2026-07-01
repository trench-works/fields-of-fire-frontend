import { Position } from "../Types";

export class LineOfSight {
    public static hasLineOfSight(
        start: Position,
        end: Position,
        isBlocking: (p: Position) => boolean,
    ): boolean {
        const isDirectDiagonal =
            Math.abs(start.x - end.x) === Math.abs(start.y - end.y);

        let x0: number = start.x;
        let y0: number = start.y;
        const x1: number = end.x;
        const y1: number = end.y;
        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = x0 < x1 ? 1 : -1;
        const sy = y0 < y1 ? 1 : -1;
        let err = dx - dy;

        while (!(x0 === x1 && y0 === y1)) {
            const e2 = 2 * err;
            const movesX = e2 > -dy;
            const movesY = e2 < dx;

            if (movesX && movesY) {
                const neighborX: Position = { x: x0 + sx, y: y0 };
                const neighborY: Position = { x: x0, y: y0 + sy };

                if (isBlocking(neighborX) && isBlocking(neighborY)) {
                    return false;
                }

                if (
                    !isDirectDiagonal &&
                    (isBlocking(neighborX) || isBlocking(neighborY))
                ) {
                    return false;
                }
            }

            if (movesX) {
                err -= dy;
                x0 += sx;
            }
            if (movesY) {
                err += dx;
                y0 += sy;
            }

            const isTarget = x0 === x1 && y0 === y1;
            if (!isTarget && isBlocking({ x: x0, y: y0 })) {
                return false;
            }
        }

        return true;
    }
}

