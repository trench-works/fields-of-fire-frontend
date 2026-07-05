import { computeFov, Position } from "../core";
import { Cell } from "../scenes/Fight/fight.scene";

export type Case = {
    isWall: boolean;
    isHole: boolean;
    entityId: string;
};

export function applyFovToRange(
    origin: Position,
    inRange: Cell[],
    board: Case[][],
): Cell[] {
    const inFovCells: Cell[] = [];
    computeFov(
        origin,
        ({ x, y }) => {
            const checkCell = board[x]?.[y];
            if (!checkCell) {
                return true;
            }
            const blocked = Boolean(checkCell.isWall || checkCell.entityId);
            if (blocked) {
                return true;
            }
            const notInRange = !inRange.some(
                ({ gridPosition }) =>
                    gridPosition.x === x && gridPosition.y === y,
            );
            return notInRange;
        },
        ({ x, y }) => {
            const cell = inRange.find(
                ({ gridPosition }) =>
                    gridPosition.x === x && gridPosition.y === y,
            );
            const inFovCell = inFovCells.find(
                ({ gridPosition }) =>
                    gridPosition.x === x && gridPosition.y === y,
            );
            if (cell && !inFovCell) {
                inFovCells.push(cell);
            }
        },
    );
    return inFovCells;
}

