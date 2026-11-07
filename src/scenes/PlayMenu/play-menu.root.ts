import { PlayMenuController } from "./controllers/play-menu.controller";
import { GameListDisplayer } from "./display/game-list.displayer";
import { LobbyListDisplayer } from "./display/lobby-list.displayer";
import { PlayMenuScene } from "./play-menu.scene";
import { GamesRepository } from "./repositories/games.repository";
import { MenuSocket } from "./repositories/menu.socket";
import { PlayMenuService } from "./services/play-menu.service";
import { GameListStore } from "./stores/game-list.store";
import { LobbyListStore } from "./stores/lobby-list.store";

export class PlayMenuRoot {
    public controllers: {
        play: PlayMenuController;
    };

    menuSocket: MenuSocket | null;

    constructor(scene: PlayMenuScene) {
        /**
         * Stores
         */
        const gameStore = new GameListStore();
        const lobbyStore = new LobbyListStore();

        /**
         * Displayers
         */
        const gameListDisplayer = new GameListDisplayer(scene, gameStore);
        const lobbyListDisplayer = new LobbyListDisplayer(scene, lobbyStore);

        /**
         * Repositories
         */
        this.menuSocket = null;
        const gameRepository = new GamesRepository();

        /**
         * Services
         */
        const playMenuService = new PlayMenuService(
            this,
            scene,
            gameStore,
            lobbyStore,
            gameListDisplayer,
            lobbyListDisplayer,
            gameRepository,
        );

        /**
         * Controllers
         */
        const playController = new PlayMenuController(playMenuService);
        this.controllers = { play: playController };
    }
}

