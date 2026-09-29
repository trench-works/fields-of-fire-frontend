import { computeFov, Position } from "../core";
import { PositionUtils } from "../core/Utils/Sizing";
import { Cell } from "../scenes/Fight/fight.scene";

export type Case = {
    isWall: boolean;
    isHole: boolean;
    entityId: string;
    position: Position;
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
            const notInRange = !inRange.some(({ index }) =>
                PositionUtils.equals(index, { x, y }),
            );
            return notInRange;
        },
        (pos) => {
            const cell = inRange.find(({ index }) =>
                PositionUtils.equals(index, pos),
            );
            const inFovCell = inFovCells.find(({ index }) =>
                PositionUtils.equals(index, pos),
            );
            if (cell && !inFovCell) {
                inFovCells.push(cell);
            }
        },
    );
    return inFovCells;
}

