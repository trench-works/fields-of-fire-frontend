import { PlayMenuService } from "../services/play-menu.service";

export class PlayMenuController {
    constructor(private readonly playMenuService: PlayMenuService) {}

    init() {
        this.playMenuService.init();
    }

    create() {
        this.playMenuService.create();
    }

    selectGame = (gameId: string) => {
        this.playMenuService.selectGame(gameId);
    };

    selectLobby = (lobbyId: string) => {
        this.playMenuService.selectLobby(lobbyId);
    };

    createLobby = () => {
        this.playMenuService.createLobby();
    };

    joinGame = () => {
        this.playMenuService.joinGame();
    };

    joinLobby = () => {
        this.playMenuService.joinLobby();
    };
}

