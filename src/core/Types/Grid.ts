export interface UiGridArea {
    x: number;
    y: number;
    width: number;
    height: number;
    centerX: number;
    centerY: number;
}

export interface UiGrid {
    x: number;
    y: number;
    cellW: number;
    cellH: number;
    getArea: (c: number, r: number, w: number, h: number) => UiGridArea;
}

