import { SceneRenderConfig } from "../Objects/GameScene";
import { Position } from "../Types/Position";

export function getPixelsFromPosition(
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

export function getMapOffset(renderConfig: SceneRenderConfig): Position {
    return new Position();
}

export function getTilePositionFromScreenPosition(
    position: Position,
    renderConfig: SceneRenderConfig
) {
    return new Position();
}

