import { Action } from "../../../Model/Action";
import { ActionRepository } from "../repositories/action.repository";
import { ActionsService } from "../services/actions.service";
import { RangeService } from "../services/range.service";
import { ActionsStore } from "../stores/actions.store";

export class ActionsController {
    constructor(
        // Stores
        private readonly actionStore: ActionsStore,
        // Repositories
        private readonly actionRepository: ActionRepository,
        // Services
        private readonly rangeService: RangeService,
        private readonly actionService: ActionsService,
    ) {}

    clearAction = () => {
        this.actionStore.selectedAction = null;
        this.rangeService.clearRange();
        this.rangeService.clearZonePreview();
        this.actionService.clearCurrentAction();
    };

    handleActionSelection = (action: Action) => {
        this.actionService.handleActionSelection(action);
    };

    finishTurn = () => {
        this.actionService.finishTurn();
    };
}

