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
    range: number
): Cell[] {
    const inFovCells: Cell[] = [];

    // Index par coordonnées : évite les find/some linéaires à chaque appel
    const key = (p: Position) => `${p.x},${p.y}`;
    const inRangeByKey = new Map(inRange.map((c) => [key(c.index), c]));
    const alreadyVisible = new Set<string>();

    computeFov(
        origin,
        ({ x, y }) => {
            const checkCell = board[x]?.[y];
            if (!checkCell) return true; // hors plateau : bloquant
            // mur ou entité bloquent, le trou ne bloque PAS la vue
            return Boolean(checkCell.isWall || checkCell.entityId);
        },
        (pos) => {
            const k = key(pos);
            const cell = inRangeByKey.get(k);
            if (cell && !alreadyVisible.has(k)) {
                alreadyVisible.add(k);
                inFovCells.push(cell);
            }
        },
        range
    );

    return inFovCells;
}
