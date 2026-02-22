export interface ScaleAndCenterParams {
    parentHeight: number;
    parentWidth: number;
    childHeight: number;
    childWidth: number;
    scaleFactor?: number;
    isometricVariation?: boolean;
}
export interface ScaleAndCenterResult {
    offsetX: number;
    offsetY: number;
    scaleFactor: number;
}

