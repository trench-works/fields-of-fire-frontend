import { ScaleAndCenterParams, ScaleAndCenterResult, Size } from "../Types";

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

export function fillFromScale(size: Size, scale: number): Size {
    const sizingRef =
        Math.min(size.height * scale, size.width / scale) ===
        size.height * scale
            ? "WIDTH"
            : "HEIGHT";

    return {
        width: sizingRef === "WIDTH" ? size.width : size.height * scale,
        height: sizingRef === "HEIGHT" ? size.height : size.width / scale,
    };
}

export function fitFromScale(size: Size, scale: number): Size {
    const sizingRef =
        Math.max(size.height * scale, size.width / scale) ===
        size.height * scale
            ? "WIDTH"
            : "HEIGHT";

    return {
        width: sizingRef === "WIDTH" ? size.width : size.height * scale,
        height: sizingRef === "HEIGHT" ? size.height : size.width / scale,
    };
}

export function conserveFromScale(size: Size, scale: number): Size {
    const fillSize = fillFromScale(size, scale);
    const fitSize = fitFromScale(size, scale);

    return {
        width: (fillSize.width + fitSize.width) / 2,
        height: (fillSize.height + fitSize.height) / 2,
    };
}

