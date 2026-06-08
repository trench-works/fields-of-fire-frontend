import { ScaleAndCenterParams, ScaleAndCenterResult } from "../Types";

export function scaleAndCenter({
    parent,
    child,
    scaleFactor,
    isometricVariation = false,
}: ScaleAndCenterParams): ScaleAndCenterResult {
    // Calcul du scaleFactor si non fourni : 60% de la taille du parent
    const finalScale =
        scaleFactor ?? computeScaleFactor(child.width, child.height, 0.6);

    // Décalage horizontal pour centrer
    const tileWidth = 64;
    const offsetX = isometricVariation
        ? parent.width / 2 - (tileWidth / 2) * finalScale
        : (parent.width - child.width * finalScale) / 2;

    // Décalage verticale pour centrer
    const offsetY = (parent.height - child.height * finalScale) / 2;

    return { offset: { x: offsetX, y: offsetY }, scaleFactor: finalScale };
}

export function computeScaleFactor(
    childWidth: number,
    childHeight: number,
    size: number,
): number {
    return (
        Math.min(
            window.innerWidth / childWidth,
            window.innerHeight / childHeight,
        ) * size
    );
}

