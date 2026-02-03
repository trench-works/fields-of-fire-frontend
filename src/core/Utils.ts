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
        isometricVariation = false
    }: ScaleAndCenterParams): ScaleAndCenterResult {

        // Calcul du scaleFactor si non fourni : 80% de la taille du parent 
        const finalScale = scaleFactor ?? Math.min(parentWidth / childWidth, parentHeight / childHeight) * 0.8;

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
