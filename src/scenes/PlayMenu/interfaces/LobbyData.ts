import { CharacterAssetId } from "../../../assets";
import { GameMode } from "../../../Model/Game";
import { TeamColor } from "../../../Model/Team";

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
    name!: string;
    creator!: string;
    mode!: GameMode;
    boardSize!: number;
    maxPlayers!: number;
    creatorId!: string;
    playerReady!: string[];
    teams!: LobbyTeam[];
}

