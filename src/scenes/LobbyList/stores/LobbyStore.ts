import { LobbyData } from "../interfaces/LobbyData";

export class LobbyStore {
    lobbies: LobbyData[];

    selectedLobbyId: string | null;

    constructor() {
        this.lobbies = [];
        this.selectedLobbyId = null;
    }

    setLobbies(lobbies: LobbyData[]): void {
        this.lobbies = lobbies;
    }

    setSelectedLobbyId(lobbyId: string | null): void {
        this.selectedLobbyId = lobbyId;
    }
}

