import { ActionsController } from "./controllers/actions.controller";
import { ActionDisplayer } from "./display/action.displayer";
import { FightScene } from "./fight.scene";
import { ActionsService } from "./services/actions.service";
import { ActionsStore } from "./stores/actions.store";
import { ClassStore } from "./stores/class.store";
import { GameStore } from "./stores/game.store";
import { GridStore } from "./stores/grid.store";
import { PlayerStore } from "./stores/player.store";

export class FightSceneRoot {
    public controllers: { actions: ActionsController };

    constructor(scene: FightScene) {
        /**
         * Stores
         */
        const actionsStore = new ActionsStore();
        const classStore = new ClassStore();
        const gameStore = new GameStore();
        const gridStore = new GridStore();
        const playerStore = new PlayerStore(classStore, gameStore);

        /**
         * Displayers
         */
        const actionDisplayer = new ActionDisplayer(
            scene,
            gameStore,
            playerStore,
        );

        /**
         * Services
         */
        const actionService = new ActionsService();

        /**
         *  Controllers
         */
        this.controllers = {
            actions: new ActionsController(),
        };
    }
}

