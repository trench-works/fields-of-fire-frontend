import { Position } from "../Types";

export enum BACKGROUND_LEVELS_OFFSET {
    WIND = 0,
}

//GRID DEPTH ARE BOUND BETWEEN 100 and 510
export enum GRID_LEVELS_OFFSET {
    HIGHTLIGHT_1 = 1,
    HIGHTLIGHT_2 = 2,
    HIGHTLIGHT_3 = 3,
    ANIMATION_1 = 4,
    OBJECT = 5,
    ANIMATION_2 = 6,
    ANIMATION_3 = 7,
    ANIMATION_4 = 8,
    TOASTER = 9,
}

export enum UI_LEVELS_OFFSET {
    CONTAINER = 100,
    TITLE = 150,
    BUTTON = 200,
    TOOLTIP = 300,
    POPUP = 500,
    POPUP_2 = 550,
    LOADER_1 = 1000,
    LOADER_2 = 1050,
}

export class Depth {
    static BACKGROUND_BASE_OFFSET = 10;
    static GRID_BASE_OFFSET = 100;
    static UI_BASE_OFFSET = Depth.GRID_BASE_OFFSET + 900;
    /**
     *
     * @param position position on grid
     * @param offset a grid object offset level
     * @returns a value between 100 and 410 depending on the x position
     */
    static getFromGridPosition(
        { x, y }: Position,
        level?: GRID_LEVELS_OFFSET,
    ): number {
        return Depth.GRID_BASE_OFFSET + (x + y) * 10 + (level ?? 0);
    }

    /**
     *
     * @param position position on grid
     * @param offset an object offset level
     * @returns
     */
    static getUIElementDepth(level?: UI_LEVELS_OFFSET): number {
        return Depth.UI_BASE_OFFSET + (level ?? 0);
    }

    /**
     *
     * @param position position on grid
     * @param offset an object offset level
     * @returns
     */
    static getBackgroundElementDepth(level?: BACKGROUND_LEVELS_OFFSET): number {
        return Depth.BACKGROUND_BASE_OFFSET + (level ?? 0);
    }
}

