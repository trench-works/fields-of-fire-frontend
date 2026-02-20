import { UiGrid } from "../Types";

export function uiGrid(
    col: number,
    row: number,
    componentWidth: number = -1,
    componentHeight: number = -1,
    cols = 9,
    rows = 9
): UiGrid {
    // Mode plein écran
    if (componentWidth === -1 || componentHeight === -1) {
        componentWidth = window.innerWidth;
        componentHeight = window.innerHeight;
    }

    // Offset automatique
    let offsetX = 0;
    let offsetY = 0;

    const cellW = componentWidth / cols;
    const cellH = componentHeight / rows;

    const gridX = offsetX + col * cellW;
    const gridY = offsetY + row * cellH;

    return {
        x: gridX,
        y: gridY,
        cellW,
        cellH,
        getArea: (c: number, r: number, w: number, h: number) => ({
            x: gridX + c * cellW,
            y: gridY + r * cellH,
            width: w * cellW,
            height: h * cellH,
            centerX: gridX + c * cellW + (w * cellW) / 2,
            centerY: gridY + r * cellH + (h * cellH) / 2,
        }),
    };
}

