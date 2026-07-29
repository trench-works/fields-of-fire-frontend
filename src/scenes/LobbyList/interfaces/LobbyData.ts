import { CharacterAssetId } from "../../../assets";

export enum TeamColor {
    BLUE = "BLUE",
    REd = "RED",
    YELLOW = "YELLOW",
    GREEN = "GREEN",
}

export class LobbyPlayer {
    userId!: string;
    playerId!: string;
    classId!: CharacterAssetId;
    name!: string;
}

export class LobbyTeam {
    players!: LobbyPlayer[];
    ai!: number;
    color!: TeamColor;
}

export class LobbyData {
    id!: string;
    name?: string;
    creator!: string;
    maxPlayers!: number;
    creatorId!: string;
    playerReady!: string[];
    teams!: LobbyTeam[];
}

export enum LobbyStatus {
    IN_GAME = "en jeu",
    OPEN = "ouvert",
}

