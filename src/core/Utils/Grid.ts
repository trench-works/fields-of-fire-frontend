import { ScaleUtils } from ".";
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

export enum ScaleMode {
    FIT = "fit",
    FILL = "fill",
    CONSERVE = "conserve",
}

export class GridArea implements Position, Size, IGridArea {
    get center() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
        };
    }

    constructor(
        public readonly x: number,
        public readonly y: number,
        public readonly width: number,
        public readonly height: number,
    ) {}

    static fromGrid(
        grid: Grid,
        {
            x,
            y,
            width = 1,
            height = 1,
            margin,
        }: Position & Partial<Size> & { margin: FourAxis },
    ): GridArea {
        const areaX = grid.x + (x - 1) * grid.cell.width + margin.left;
        const areaY = grid.y + (y - 1) * grid.cell.height + margin.top;

        const areaWidth = width * grid.cell.width - margin.left - margin.right;
        const areaHeight =
            height * grid.cell.height - margin.top - margin.bottom;

        return new GridArea(areaX, areaY, areaWidth, areaHeight);
    }

    static fromPositionAndSize({
        x,
        y,
        width,
        height,
    }: Position & Size): GridArea {
        return new GridArea(x, y, width, height);
    }

    static fromCenter(center: Position, { width, height }: Size): GridArea {
        const x = center.x - width / 2;
        const y = center.y - height / 2;
        return this.fromPositionAndSize({ x, y, width, height });
    }

    getGrid(options?: GetGridOptions): Grid {
        return new Grid({
            offset: { x: this.x, y: this.y },
            size: { width: this.width, height: this.height },
            ...options,
        });
    }

    /**
     *
     * @param scale Scale is targeted report between width and height, it correspond to width / height
     * @param scaleMode Scale mode will determine the final size of the element
     * @returns a new grid area
     */
    scaleFromCenter(scale: number, scaleMode: ScaleMode): GridArea {
        let newSize: Size;
        switch (scaleMode) {
            case ScaleMode.FILL:
                newSize = ScaleUtils.fillFromScale(this, scale);
                break;
            case ScaleMode.FIT:
                newSize = ScaleUtils.fitFromScale(this, scale);
                break;
            case ScaleMode.CONSERVE:
                newSize = ScaleUtils.conserveFromScale(this, scale);
                break;
        }
        return GridArea.fromCenter(this.center, newSize);
    }
}

export class Grid implements Position, Size {
    x: number;
    y: number;
    width: number;
    height: number;

    cell: Size;

    public readonly options: { division: TwoAxis };

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

        this.options = { division: this.division };

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
        return GridArea.fromGrid(this, { ...options, margin });
    }
}

