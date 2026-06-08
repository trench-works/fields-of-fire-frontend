import { FourAxis, Position, Size, TwoAxis } from "../Types";
import { AxisUtils } from "./Sizing";

export type GridOptions = {
    position?: Position;
    size?: Size;
    division?: TwoAxis;
    offset?: Position;
    padding?: TwoAxis | FourAxis;
};

export class Grid implements Position, Size {
    x: number;
    y: number;
    width: number;
    height: number;

    cell: Size;

    constructor(options?: GridOptions) {
        const position = options?.position ?? { x: 0, y: 0 };
        const size = options?.size ?? {
            width: window.innerWidth,
            height: window.innerHeight,
        };
        const division = options?.division ?? { vertical: 9, horizontal: 9 };
        const offset = options?.offset ?? { x: 0, y: 0 };
        const padding: FourAxis = options?.padding
            ? AxisUtils.fromTwoOrFourAxis(options.padding)
            : { top: 0, bottom: 0, right: 0, left: 0 };

        this.width = size.width - padding.left - padding.right;
        this.height = size.height - padding.top - padding.bottom;

        this.cell = {
            width: this.width / division.horizontal,
            height: this.height / division.vertical,
        };

        this.x = offset.x + position.x * this.cell.width + padding.left;
        this.y = offset.y + position.y * this.cell.height + padding.top;
    }

    getArea(
        c: number,
        r: number,
        w: number,
        h: number,
    ): Position & Size & { center: Position } {
        return {
            x: this.x + c * this.cell.width,
            y: this.y + r * this.cell.height,
            width: w * this.cell.width,
            height: h * this.cell.height,
            center: {
                x: this.x + c * this.cell.width + (w * this.cell.width) / 2,
                y: this.y + r * this.cell.height + (h * this.cell.height) / 2,
            },
        };
    }
}

