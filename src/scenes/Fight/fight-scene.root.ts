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
import { ParticleDisplayer } from "./display/particles.displayer";
import { StatsDisplayer } from "./display/stats.displayer";
import { ToastDisplayer } from "./display/toast.displayer";
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
import { AnimationService } from "./services/animation.service";
import { GameUpdateService } from "./services/game-update.service";
import { GameService } from "./services/game.service";
import { GridService } from "./services/grid.service";
import { InspectCharacterService } from "./services/inspect-character.service";
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

        /**
         * Displayers
         */
        const characterDisplayer = new CharactersDisplayer(
            scene,
            gameStore,
            playerStore,
            gridStore,
        );
        const actionDisplayer = new ActionDisplayer(
            scene,
            gameStore,
            playerStore,
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
        const wallDisplayer = new WallDisplayer(scene, gameStore, gridStore);
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
        const particleDisplayer = new ParticleDisplayer(scene);
        const toaster = new ToastDisplayer(scene, gridStore);
        const attackDisplayer = new AttackDisplayer(
            scene,
            gameStore,
            gridStore,
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
        const rangeService = new RangeService(scene, gameStore, gridStore);
        const actionService = new ActionsService(
            playerStore,
            actionsStore,
            actionRepository,
            rangeService,
            actionDisplayer,
        );
        const inspectStatsService = new InspectCharacterService(
            gameStore,
            classStore,
            inspectStatsDisplayer,
        );
        const gridService = new GridService(
            scene,
            gameStore,
            gridStore,
            classStore,
            playerStore,
            actionsStore,
            actionService,
            rangeService,
            inspectStatsService,
            characterDisplayer,
        );
        const animationService = new AnimationService(
            scene,
            gridStore,
            gameStore,
            attackDisplayer,
            characterDisplayer,
            toaster,
            particleDisplayer,
        );
        const gameUpdateService = new GameUpdateService(
            gameStore,
            playerStore,
            actionService,
            inspectStatsService,
            animationService,
            boardDisplayer,
            actionDisplayer,
            turnsDisplayer,
            characterDisplayer,
            playerStatsDisplayer,
            inspectStatsDisplayer,
        );
        const gameUpdateQueue = new EventQueue<GameUpdateEvent>((event) =>
            gameUpdateService.handleUpdate(event.data, event.animations),
        );
        const gameService = new GameService(
            this,
            scene,
            gameStore,
            playerStore,
            gameUpdateQueue,
            actionService,
            inspectStatsService,
            connectingRepository,
            gameRepository,
            actionRepository,
            boardDisplayer,
            actionDisplayer,
            turnsDisplayer,
            characterDisplayer,
            playerStatsDisplayer,
            inspectStatsDisplayer,
            endFightDisplayer,
            particleDisplayer,
        );

        /**
         *  Controllers
         */
        this.controllers = {
            game: new GameController(gameService, inspectStatsService),
            actions: new ActionsController(actionService),
            grid: new GridController(gridService),
        };

        /**
         * TODO: remove this logic here into a service running when accessing the scene
         */
        new ClassesRepository()
            .getClasses()
            .then((data) => classStore.setClasses(data));
    }
}

