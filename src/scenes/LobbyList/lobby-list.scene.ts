import { MenuSocket } from "./repositories/menu.socket";
import { LobbySceneInit } from "../Lobby/lobby.scene";

export class LobbyListScene extends Phaser.Scene {
    private backgroundImage = "red_bg";
    public menuSocket!: MenuSocket;

    constructor() {
        super({ key: "lobbyListScene" });
    }

    preload() {
        this.load.image(
            this.backgroundImage,
            `assets/${this.backgroundImage}.png`,
        );
    }

    startLobbyScene(data: LobbySceneInit) {
        this.scene.start("lobbyScene", data);
    }

    create() {
        this.menuSocket = new MenuSocket();

        this.menuSocket.onJoin(
            ({ lobby: { lobbyId }, player: { playerId } }) => {
                console.log(
                    `Rejoint le lobby ${lobbyId} en tant que joueur ${playerId}`,
                );
                this.startLobbyScene({
                    lobbyId,
                    playerId,
                });
            },
        );
    }
}

