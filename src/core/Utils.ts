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
) {
    if (componentWidth === -1 || componentHeight === -1) {
        componentWidth = window.innerWidth;
        componentHeight = window.innerHeight;
    }
    const cellW = componentWidth / cols;
    const cellH = componentHeight / rows;
    return {
        x: col * cellW,
        y: row * cellH,
        cellW,
        cellH,
        getArea: (c: number, r: number, w: number, h: number) => ({
            x: c * cellW,
            y: r * cellH,
            width: w * cellW,
            height: h * cellH,
            centerX: c * cellW + (w * cellW) / 2,
            centerY: r * cellH + (h * cellH) / 2,
        }),
    };
}

export function parseColor(color?: string): number {
    if (!color) return 0xffffff;
    return Phaser.Display.Color.HexStringToColor(color).color;
}