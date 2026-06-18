import { LobbyData } from "../interfaces/LobbyData";

type CurrentLobby = {
    lobbyId: string;
    players: { playerId: string; classId: string; userId: string }[];
};
export class LobbyStore {
    lobbies: LobbyData[];
    currentLobby: CurrentLobby | null = null
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

    setCurrentLobby(lobby: CurrentLobby): void {
        this.currentLobby = lobby;
    }

    getCurrentLobby(lobbyId: string): LobbyData | undefined {
        return this.lobbies.find((lobby) => lobby.id === lobbyId);
    }
}


