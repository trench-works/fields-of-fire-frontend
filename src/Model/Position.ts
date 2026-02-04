import { SceneRenderConfig } from "./GameScene";


export class Position {
    public x: number;
    public y: number;

    constructor(x?: number, y?: number) {
        this.x = x ?? 0;
        this.y = y ?? 0;
    }

    add(position: Position): void {
        this.x += position.x;
        this.y += position.y;
    }
}

export class PositionUtils {
    static getPixelsFromPosition(
        position: Position,
        renderConfig?: SceneRenderConfig
    ): Position {
        const tileSize = renderConfig?.tileSize ?? 64;
        if (renderConfig?.renderType === "ISOMETRIC") {
            return new Position(
                position.x * tileSize + renderConfig.offset.x,
                position.y * (tileSize / 2) + renderConfig.offset.y
            );
        }
        return new Position(
            position.x * tileSize + (renderConfig?.offset.x ?? 0),
            position.y * tileSize + (renderConfig?.offset.y ?? 0)
        );
    }

    static getMapOffset(renderConfig: SceneRenderConfig): Position {
        return new Position();
    }

    static getTilePositionFromScreenPosition(
        position: Position,
        renderConfig: SceneRenderConfig
    ) {
        return new Position();
    }
}