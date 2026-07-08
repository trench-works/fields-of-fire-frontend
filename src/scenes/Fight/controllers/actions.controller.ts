import { ActionsService } from "../services/actions.service";
import { RangeService } from "../services/range.service";
import { ActionsStore } from "../stores/actions.store";

export class ActionsController {
    constructor(
        private readonly actionStore: ActionsStore,
        private readonly rangeService: RangeService,
        private readonly actionService: ActionsService,
    ) {}

    clearAction() {
        this.actionStore.selectedAction = null;
        this.rangeService.clearRange();
        this.rangeService.clearZonePreview();
        this.actionService.clearCurrentAction();
    }
}

