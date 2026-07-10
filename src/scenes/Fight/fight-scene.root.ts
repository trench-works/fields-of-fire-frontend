import { EventQueue } from "../../core";
import { ClassesRepository } from "../Lobby/repositories/classes.repository";
import { ActionsController } from "./controllers/actions.controller";
import { GameController } from "./controllers/game.controller";
import { GridController } from "./controllers/grid.controller";
import { ActionDisplayer } from "./display/action.displayer";
import { AttackDisplayer } from "./display/attack.displayer";
import { BoardDisplayer } from "./display/board.displayer";
import { CharactersDisplayer } from "./display/characters.displayer";
import { EndFightDisplayer } from "./display/end-fight.displayer";
import { GroundDisplayer } from "./display/ground.displayer";
import { StatsDisplayer } from "./display/stats.displayer";
import { TurnDisplayer } from "./display/turns.displayer";
import { WallDisplayer } from "./display/wall.displayer";
import { FightScene } from "./fight.scene";
import { ActionRepository } from "./repositories/action.repository";
import { ConnectingRepository } from "./repositories/connecting.repository";
import {
    GameRepository,
    GameUpdateEvent,
} from "./repositories/game.repository";
import { GamePlayerSocket } from "./repositories/player.socket";
import { ActionsService } from "./services/actions.service";
import { RangeService } from "./services/range.service";
import { ActionsStore } from "./stores/actions.store";
import { ClassStore } from "./stores/class.store";
import { GameStore } from "./stores/game.store";
import { GridStore } from "./stores/grid.store";
import { PlayerStore } from "./stores/player.store";

export class FightSceneRoot {
    public controllers: {
        game: GameController;
        actions: ActionsController;
        grid: GridController;
    };

    public playerSocket: GamePlayerSocket | null;

    constructor(scene: FightScene) {
        /**
         * Stores
         */
        const actionsStore = new ActionsStore();
        const classStore = new ClassStore();
        const gameStore = new GameStore();
        const gridStore = new GridStore();
        const playerStore = new PlayerStore(classStore, gameStore);
        const gameUpdateQueue = new EventQueue<GameUpdateEvent>((event) =>
            this.controllers.game.handleUpdate(event.data, event.animations),
        );

        /**
         * Displayers
         */
        const characterDisplayer = new CharactersDisplayer(
            scene,
            gameStore,
            playerStore,
        );
        const actionDisplayer = new ActionDisplayer(
            scene,
            gameStore,
            playerStore,
            actionsStore,
        );
        const playerStatsDisplayer = new StatsDisplayer(scene, gameStore, {
            x: 1,
            y: 7,
        });
        const inspectStatsDisplayer = new StatsDisplayer(scene, gameStore, {
            x: 8,
            y: 7,
        });
        const groundDisplayer = new GroundDisplayer(
            scene,
            gameStore,
            playerStore,
            gridStore,
        );
        const wallDisplayer = new WallDisplayer(scene, gameStore);
        const boardDisplayer = new BoardDisplayer(
            scene,
            groundDisplayer,
            wallDisplayer,
        );
        const turnsDisplayer = new TurnDisplayer(scene, gameStore, classStore);
        const endFightDisplayer = new EndFightDisplayer(
            scene,
            gameStore,
            playerStore,
        );
        const attackDisplayer = new AttackDisplayer(
            scene,
            gameStore,
            characterDisplayer,
        );

        /**
         * Repositories
         */
        this.playerSocket = null;
        const gameRepository = new GameRepository(this);
        const connectingRepository = new ConnectingRepository(this);
        const actionRepository = new ActionRepository(this);

        /**
         * Services
         */
        const rangeService = new RangeService(scene, gameStore);
        const actionService = new ActionsService(
            playerStore,
            actionsStore,
            actionRepository,
            rangeService,
            actionDisplayer,
        );

        /**
         *  Controllers
         */
        this.controllers = {
            game: new GameController(
                this,
                scene,
                gameStore,
                playerStore,
                classStore,
                gameUpdateQueue,
                actionService,
                connectingRepository,
                gameRepository,
                actionRepository,
                boardDisplayer,
                actionDisplayer,
                turnsDisplayer,
                characterDisplayer,
                playerStatsDisplayer,
                inspectStatsDisplayer,
                attackDisplayer,
                endFightDisplayer,
            ),
            actions: new ActionsController(
                actionsStore,
                actionRepository,
                rangeService,
                actionService,
            ),
            grid: new GridController(
                scene,
                gameStore,
                gridStore,
                classStore,
                playerStore,
                actionService,
                rangeService,
                characterDisplayer,
            ),
        };

        /**
         * TODO: remove this logic here into a service running when accessing the scene
         */
        new ClassesRepository()
            .getClasses()
            .then((data) => classStore.setClasses(data));
    }
}

