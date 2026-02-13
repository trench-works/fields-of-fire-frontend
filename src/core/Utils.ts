interface ScaleAndCenterParams {
    parentHeight: number;
    parentWidth: number;
    childHeight: number;
    childWidth: number;
    scaleFactor?: number;
    isometricVariation?: boolean;
}

interface ScaleAndCenterResult {
    offsetX: number;
    offsetY: number;
    scaleFactor: number;
}

export class Utils {
    public static scaleAndCenter({
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

export function uiGrid(
    col: number,
    row: number,
    componentWidth: number = -1,
    componentHeight: number = -1,
    cols = 9,
    rows = 9,
    parent?: { x: number; y: number; width: number; height: number }
) {
    // Mode plein écran
    if (componentWidth === -1 || componentHeight === -1) {
        componentWidth = window.innerWidth;
        componentHeight = window.innerHeight;
    }

    // Offset automatique
    let offsetX = 0;
    let offsetY = 0;

    if (parent) {
        offsetX = parent.x - parent.width / 2;
        offsetY = parent.y - parent.height / 2;
    }

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


export function parseColor(color?: string): number {
    if (!color) return 0xffffff;
    return Phaser.Display.Color.HexStringToColor(color).color;
}