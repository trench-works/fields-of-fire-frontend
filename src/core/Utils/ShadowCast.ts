import { Position } from "../Types";

export function computeFov(
    origin: Position,
    isBlocking: (position: Position) => boolean,
    markVisible: (position: Position) => void,
): void {
    markVisible(origin);

    for (let i = 0; i < 4; i++) {
        const quadrant = new Quadrant(i, origin);

        const reveal = (tile: Position) => {
            const position = quadrant.transform(tile);
            markVisible(position);
        };

        const isWall = (tile: Position | null): boolean => {
            if (tile === null) return false;
            const position = quadrant.transform(tile);
            return isBlocking(position);
        };

        const isFloor = (tile: Position | null): boolean => {
            if (tile === null) return false;
            const position = quadrant.transform(tile);
            return !isBlocking(position);
        };

        const scan = (row: Row): void => {
            let prevTile: Position | null = null;

            for (const tile of row.tiles()) {
                if (isWall(tile) || isSymmetric(row, tile)) {
                    reveal(tile);
                }

                if (isWall(prevTile) && isFloor(tile)) {
                    row.startSlope = slope(tile);
                }

                if (isFloor(prevTile) && isWall(tile)) {
                    const nextRow = row.next();
                    nextRow.endSlope = slope(tile);
                    scan(nextRow);
                }

                prevTile = tile;
            }

            if (isFloor(prevTile)) {
                scan(row.next());
            }
        };

        scan(new Row(1, -1, 1));
    }
}

class Quadrant {
    static readonly NORTH = 0;
    static readonly EAST = 1;
    static readonly SOUTH = 2;
    static readonly WEST = 3;

    constructor(
        public cardinal: number,
        public origin: Position,
    ) {}

    transform(tile: Position): Position {
        const { x: row, y: col } = tile;
        const { x: ox, y: oy } = this.origin;

        switch (this.cardinal) {
            case Quadrant.NORTH:
                return { x: ox + col, y: oy - row };
            case Quadrant.SOUTH:
                return { x: ox + col, y: oy + row };
            case Quadrant.EAST:
                return { x: ox + row, y: oy + col };
            case Quadrant.WEST:
                return { x: ox - row, y: oy + col };

            default:
                throw new Error("Invalid quadrant");
        }
    }
}

class Row {
    constructor(
        public depth: number,
        public startSlope: number,
        public endSlope: number,
    ) {}

    *tiles(): IterableIterator<Position> {
        const minCol = roundTiesUp(this.depth * this.startSlope);
        const maxCol = roundTiesDown(this.depth * this.endSlope);

        for (let col = minCol; col <= maxCol; col++) {
            yield { x: this.depth, y: col };
        }
    }

    next(): Row {
        return new Row(this.depth + 1, this.startSlope, this.endSlope);
    }
}

function slope(tile: Position): number {
    const { x: rowDepth, y: col } = tile;
    return (2 * col - 1) / (2 * rowDepth);
}

function isSymmetric(row: Row, tile: Position): boolean {
    const { y: col } = tile;

    return col >= row.depth * row.startSlope && col <= row.depth * row.endSlope;
}

function roundTiesUp(n: number): number {
    return Math.floor(n + 0.5);
}

function roundTiesDown(n: number): number {
    return Math.ceil(n - 0.5);
}

