import { Position } from "../../../core";
import { GridService } from "../services/grid.service";

export class GridController {
    constructor(private readonly gridService: GridService) {}

    cellClick = (position: Position) => {
        this.gridService.cellClick(position);
    };

    cellHover = (position: Position) => {
        this.gridService.cellHover(position);
    };

    cellHoverOut = (position: Position) => {
        this.gridService.cellHoverOut(position);
    };
}

