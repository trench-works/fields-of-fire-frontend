import { FourAxis, Position, TwoAxis } from "../Types/Sizing";

export class PositionUtils {
    static add(a: Position, b: Position): Position {
        return {
            x: a.x + b.x,
            y: a.y + b.y,
        };
    }

    static distance(a: Position, b: Position): number {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }

    static subtract(a: Position, b: Position): Position {
        return {
            x: a.x - b.x,
            y: a.y - b.y,
        };
    }

    static multiply({ x, y }: Position, multiplier: number): Position {
        return {
            x: x * multiplier,
            y: y * multiplier,
        };
    }

    static divide({ x, y }: Position, divider: number): Position {
        return {
            x: x / divider,
            y: y / divider,
        };
    }

    static equals(a: Position, b: Position): boolean {
        return a.x === b.x && a.y === b.y;
    }
}

export class AxisUtils {
    static isTwoAxis(axis: TwoAxis | FourAxis | number): axis is TwoAxis {
        return (axis as TwoAxis)["vertical"] !== undefined;
    }
    static isFourAxis(axis: TwoAxis | FourAxis | number): axis is FourAxis {
        return (axis as FourAxis)["top"] !== undefined;
    }

    static toFourAxis(axis: TwoAxis): FourAxis {
        return {
            top: axis.vertical,
            bottom: axis.vertical,
            right: axis.horizontal,
            left: axis.horizontal,
        };
    }

    static fromTwoOrFourAxis(axis: TwoAxis | FourAxis | number): FourAxis {
        if (AxisUtils.isTwoAxis(axis)) {
            return AxisUtils.toFourAxis(axis);
        }
        if (AxisUtils.isFourAxis(axis)) {
            return axis;
        }
        return { top: axis, bottom: axis, left: axis, right: axis };
    }
}

