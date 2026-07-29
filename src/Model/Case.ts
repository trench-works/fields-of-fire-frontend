import { computeFov, Position } from "../core";
import { PositionUtils } from "../core/Utils/Sizing";
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
    console.log(board);
    computeFov(
        origin,
        ({ x, y }) => {
            const checkCell = board[x]?.[y];
            if (!checkCell) {
                console.log("NOT CHECK CELL", { x, y });
                return true;
            }
            const blocked = Boolean(checkCell.isWall || checkCell.entityId);
            if (blocked) {
                return true;
            }
            const notInRange = !inRange.some(({ gridPosition }) =>
                PositionUtils.equals(gridPosition, { x, y }),
            );
            return notInRange;
        },
        (pos) => {
            const cell = inRange.find(({ gridPosition }) =>
                PositionUtils.equals(gridPosition, pos),
            );
            const inFovCell = inFovCells.find(({ gridPosition }) =>
                PositionUtils.equals(gridPosition, pos),
            );
            if (cell && !inFovCell) {
                inFovCells.push(cell);
            }
        },
    );
    return inFovCells;
}

