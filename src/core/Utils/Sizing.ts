import { SceneRenderConfig } from "../../scenes/Fight/fight.scene";
import { FourAxis, Position, TwoAxis } from "../Types/Sizing";

export function getPixelsFromPosition(
    position: Position,
    renderConfig?: SceneRenderConfig,
): Position {
    const tileSize = renderConfig?.tileSize ?? 64;
    if (renderConfig?.renderType === "ISOMETRIC") {
        return {
            x: position.x * tileSize + renderConfig.offset.x,
            y: position.y * (tileSize / 2) + renderConfig.offset.y,
        };
    }
    return {
        x: position.x * tileSize + (renderConfig?.offset.x ?? 0),
        y: position.y * tileSize + (renderConfig?.offset.y ?? 0),
    };
}

export function getTilePositionFromScreenPosition(
    _position: Position,
    _renderConfig: SceneRenderConfig,
) {
    return { x: 0, y: 0 };
}

export class PositionUtils {
    static add(a: Position, b: Position): Position {
        return {
            x: a.x + b.x,
            y: a.y + b.y,
        };
    }

    static getMapOffset(_renderConfig: SceneRenderConfig): Position {
        return { x: 0, y: 0 };
    }
}

export class AxisUtils {
    static isTwoAxis(axis: TwoAxis | FourAxis): axis is TwoAxis {
        return (axis as TwoAxis)["vertical"] !== undefined;
    }

    static toFourAxis(axis: TwoAxis): FourAxis {
        return {
            top: axis.vertical,
            bottom: axis.vertical,
            right: axis.horizontal,
            left: axis.horizontal,
        };
    }

    static fromTwoOrFourAxis(axis: TwoAxis | FourAxis): FourAxis {
        if (AxisUtils.isTwoAxis(axis)) {
            return AxisUtils.toFourAxis(axis);
        }
        return axis;
    }
}

