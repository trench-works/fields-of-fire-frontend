import { GameMode } from "../../../Model/Game";
import { LobbyData } from "../../LobbyList/interfaces/LobbyData";

export class LobbyStore {
    lobby: LobbyData | undefined;

    boardSize: number;
    gameMode: GameMode;
    name: string;

    constructor() {
        this.lobby = undefined;
        this.boardSize = 10;
        this.gameMode = GameMode.INFINITY;
        this.name = "Partie de NO_NAME";
    }

    setLobby(lobby: LobbyData): this {
        this.lobby = lobby;
        this.resetSettings();
        return this;
    }

    applySettings(): this {
        if (this.lobby) {
            this.lobby.boardSize = this.boardSize;
            this.lobby.mode = this.gameMode;
            this.lobby.name = this.name;
        }
        return this;
    }

    resetSettings(): this {
        if (this.lobby) {
            this.boardSize = this.lobby.boardSize;
            this.gameMode = this.lobby.mode;
            this.name = this.lobby.name;
        }
        return this;
    }
}

