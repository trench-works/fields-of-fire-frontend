import { GameMode } from "../../../Model/Game";
import { LobbyData } from "../../LobbyList/interfaces/LobbyData";

export class LobbyStore {
    lobby: LobbyData | undefined;
    boardSize: number;
    gameMode: GameMode;

    constructor() {
        this.lobby = undefined;
        this.boardSize = 10;
        this.gameMode = GameMode.INFINITY;
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
        }
        return this;
    }

    resetSettings(): this {
        if (this.lobby) {
            this.boardSize = this.lobby.boardSize;
            this.gameMode = this.lobby.mode;
        }
        return this;
    }
}

