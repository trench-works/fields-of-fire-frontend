import { ScaleAndCenterParams, ScaleAndCenterResult } from "../Types";

export function scaleAndCenter({
    parentHeight,
    parentWidth,
    childHeight,
    childWidth,
    scaleFactor,
    isometricVariation = false,
}: ScaleAndCenterParams): ScaleAndCenterResult {
    // Calcul du scaleFactor si non fourni : 80% de la taille du parent
    const finalScale =
        scaleFactor ?? computeScaleFactor(childWidth, childHeight, 0.7);

    // Décalage horizontal pour centrer
    const tileWidth = 64;
    const offsetX = isometricVariation
        ? parentWidth / 2 - (tileWidth / 2) * finalScale
        : (parentWidth - childWidth * finalScale) / 2;

    // Décalage verticale pour centrer
    const offsetY = (parentHeight - childHeight * finalScale) / 2;

    return { offsetX, offsetY, scaleFactor: finalScale };
}

export function computeScaleFactor(
    childWidth: number,
    childHeight: number,
    size: number
): number {
    return (
        Math.min(
            window.innerWidth / childWidth,
            window.innerHeight / childHeight
        ) * size
    );
}

