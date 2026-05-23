export interface LobbyData {
    lobbyId: string;
    lobbyName: string;
    players: number;
    maxPlayers: number;
    creator: string;
    status: LobbyStatus;
}

export enum LobbyStatus {
    IN_GAME = "en jeu",
    OPEN = "ouvert"
}
