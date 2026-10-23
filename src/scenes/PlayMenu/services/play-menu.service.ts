import { FightScene } from "../../Fight/fight.scene";
import { LobbyScene } from "../../Lobby/lobby.scene";
import { MainMenu } from "../../MainMenu/main-menu.scene";
import { GameListDisplayer } from "../display/game-list.displayer";
import { LobbyListDisplayer } from "../display/lobby-list.displayer";
import { Game } from "../interfaces/Game";
import { LobbyData } from "../interfaces/LobbyData";
import { PlayMenuRoot } from "../play-menu.root";
import { PlayMenuScene } from "../play-menu.scene";
import { GamesRepository } from "../repositories/games.repository";
import { MenuSocket, Update } from "../repositories/menu.socket";
import { GameListStore } from "../stores/game-list.store";
import { LobbyListStore } from "../stores/lobby-list.store";

export class PlayMenuService {
    constructor(
        private readonly root: PlayMenuRoot,
        private readonly scene: PlayMenuScene,
        // Stores
        private readonly gameStore: GameListStore,
        private readonly lobbyStore: LobbyListStore,
        // Displayers
        private readonly gameDisplayer: GameListDisplayer,
        private readonly lobbyDisplayer: LobbyListDisplayer,
        // Repositories
        private readonly gamesRepository: GamesRepository,
    ) {}

    init() {
        this.gameStore.setSelectedGameId(null);
        this.lobbyStore.setSelectedLobbyId(null);
        this.gameDisplayer.preRender();
        this.lobbyDisplayer.preRender();
        this.root.menuSocket = new MenuSocket();
        this.root.menuSocket.onClose(() => {
            this.root.menuSocket?.close();
            MainMenu.start(this.scene);
        });
        this.root.menuSocket.onUpdate((data: Update) => {
            this.updateLobbies(data.lobbies);
        });
        this.root.menuSocket.onReconnect(({ game, player }) => {
            this.root.menuSocket?.close();
            FightScene.start(this.scene, {
                data: {
                    game,
                    player,
                },
            });
        });
        this.root.menuSocket.onJoin(({ lobby }) => {
            this.root.menuSocket?.close();
            LobbyScene.start(this.scene, {
                data: { lobby },
            });
        });
        this.gamesRepository.getGames().then((data) => this.updateGames(data));
    }

    create() {
        this.gameDisplayer.render();
        this.lobbyDisplayer.render();
    }

    updateGames(games: Game[]) {
        this.gameStore.setGames(games);
        this.gameDisplayer.update();
    }

    updateLobbies(lobbies: LobbyData[]) {
        this.lobbyStore.setLobbies(lobbies);
        if (
            this.lobbyStore.selectedLobbyId &&
            !lobbies.some(
                (lobby) => lobby.id === this.lobbyStore.selectedLobbyId,
            )
        ) {
            // reset selected lobby id if its not in the list anymore
            this.lobbyStore.setSelectedLobbyId(null);
        }
        this.lobbyDisplayer.update();
    }

    selectGame(gameId: string) {
        this.gameStore.setSelectedGameId(gameId);
        this.gameDisplayer.update();
    }

    selectLobby(lobbyId: string) {
        this.lobbyStore.setSelectedLobbyId(lobbyId);
        this.lobbyDisplayer.update();
    }

    createLobby() {
        this.root.menuSocket?.createLobby();
    }

    joinGame() {
        if (this.gameStore.selectedGameId) {
            // this.root.menuSocket?.joinGame({
            //     gameId: this.gameStore.selectedGameId,
            // });
        }
    }

    joinLobby() {
        if (this.lobbyStore.selectedLobbyId) {
            this.root.menuSocket?.joinLobby({
                lobbyId: this.lobbyStore.selectedLobbyId,
            });
        }
    }
}

