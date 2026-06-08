import { FourAxis, Position, Size, TwoAxis } from "../Types";
import { AxisUtils } from "./Sizing";

export type GridOptions = {
    position?: Position;
    size?: Size;
    division?: TwoAxis;
    offset?: Position;
    padding?: TwoAxis | FourAxis;
};

export class GridArea implements Position, Size {
    x: number;
    y: number;
    width: number;
    height: number;

    center: Position;

    constructor(
        grid: Grid,
        { x, y, width = 1, height = 1 }: Position & Partial<Size>,
    ) {
        this.x = grid.x + x * grid.cell.width;
        this.y = grid.y + y * grid.cell.height;

        this.width = width * grid.cell.width;
        this.height = height * grid.cell.height;

        this.center = {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
        };
    }
}

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

    getArea(options: Position & Partial<Size>): GridArea {
        return new GridArea(this, options);
    }
}

