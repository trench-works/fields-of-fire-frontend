import { LobbyData } from "../../LobbyList/interfaces/LobbyData";

export class LobbyStore {
    lobby: LobbyData | undefined;

    constructor() {
        this.lobby = undefined;
    }

    setLobby(lobby: LobbyData): this {
        this.lobby = lobby;
        return this;
    }
}
