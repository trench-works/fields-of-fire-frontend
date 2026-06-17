import { Position, Size } from "./Sizing";

export interface ScaleAndCenterParams {
    parent: Size;
    child: Size;
    scaleFactor?: number;
    isometricVariation?: boolean;
}
export interface ScaleAndCenterResult {
    offset: Position;
    scaleFactor: number;
}

export enum PlacementOrigin {
    CENTER = "center",
    UPPER_LEFT_CORNER = "ul_corner",
}
