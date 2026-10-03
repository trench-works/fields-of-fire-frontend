import { Action } from "../../../Model/Action";
import { ActionsService } from "../services/actions.service";

export class ActionsController {
    constructor(private readonly actionService: ActionsService) {}

    clearAction = () => {
        this.actionService.clearAction();
    };

    handleActionSelection = (action: Action) => {
        this.actionService.handleActionSelection(action);
    };

    finishTurn = () => {
        this.actionService.finishTurn();
    };
}

