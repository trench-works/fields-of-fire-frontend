import { GridService } from "../services/grid.service";

export class DisplayController {
    constructor(private readonly gridService: GridService) {}

    refreshTooltip() {
        this.gridService.refreshHover();
    }
}
