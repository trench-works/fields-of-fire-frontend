import { FourAxis, Position, Size, TwoAxis } from "../Types";
import { AxisUtils } from "./Sizing";

export type GridOptions = {
    size?: Size;
    division?: TwoAxis;
    offset?: Position;
    padding?: TwoAxis | FourAxis | number;
    margin?: TwoAxis | FourAxis | number;
};

export type GetGridOptions = {
    division?: TwoAxis;
    offset?: Position;
    padding?: TwoAxis | FourAxis | number;
    margin?: TwoAxis | FourAxis | number;
};

export type IGridArea = {
    x: number;
    y: number;
    width: number;
    height: number;

    center: Position;
};

export class GridArea implements Position, Size, IGridArea {
    x: number;
    y: number;
    width: number;
    height: number;

    center: Position;

    constructor(
        grid: Grid,
        {
            x,
            y,
            width = 1,
            height = 1,
            margin,
        }: Position & Partial<Size> & { margin: FourAxis },
    ) {
        this.x = grid.x + (x - 1) * grid.cell.width + margin.left;
        this.y = grid.y + (y - 1) * grid.cell.height + margin.right;

        this.width = width * grid.cell.width - margin.left - margin.right;
        this.height = height * grid.cell.height - margin.top - margin.bottom;

        this.center = {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
        };
    }

    getGrid(options?: GetGridOptions): Grid {
        return new Grid({
            offset: { x: this.x, y: this.y },
            size: { width: this.width, height: this.height },
            ...options,
        });
    }
}

export class Grid implements Position, Size {
    x: number;
    y: number;
    width: number;
    height: number;

    cell: Size;

    get center() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
        };
    }

    public division: TwoAxis;

    protected padding: FourAxis;

    constructor(options?: GridOptions) {
        const size = options?.size ?? {
            width: window.innerWidth,
            height: window.innerHeight,
        };
        this.division = options?.division ?? { vertical: 9, horizontal: 9 };
        const offset = options?.offset ?? { x: 0, y: 0 };
        this.padding = options?.padding
            ? AxisUtils.fromTwoOrFourAxis(options.padding)
            : { top: 0, bottom: 0, right: 0, left: 0 };
        const margin: FourAxis = options?.margin
            ? AxisUtils.fromTwoOrFourAxis(options.margin)
            : { top: 0, bottom: 0, right: 0, left: 0 };

        this.width = size.width - margin.left - margin.right;
        this.height = size.height - margin.top - margin.bottom;

        this.cell = {
            width: this.width / this.division.horizontal,
            height: this.height / this.division.vertical,
        };

        this.x = offset.x + margin.left;
        this.y = offset.y + margin.top;
    }

    getSubGrid(
        areaOptions: Position &
            Partial<Size> & {
                margin?: TwoAxis | FourAxis | number;
            },
        gridOptions?: GetGridOptions,
    ): Grid {
        return this.getArea(areaOptions).getGrid(gridOptions);
    }

    getArea(
        options: Position &
            Partial<Size> & {
                margin?: TwoAxis | FourAxis | number;
            },
    ): GridArea {
        const margin: FourAxis = options?.margin
            ? AxisUtils.fromTwoOrFourAxis(options.margin)
            : this.padding;
        return new GridArea(this, { ...options, margin });
    }
}

