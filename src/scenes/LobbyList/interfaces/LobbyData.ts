export class LobbyPlayer {
    userId!: string;
    playerId!: string;
    classId!: string;
}

export class LobbyData {
    id!: string;
    maxPlayers!: number;
    creatorId!: string;
    players!: LobbyPlayer[];
}

export enum LobbyStatus {
    IN_GAME = "en jeu",
    OPEN = "ouvert",
}

