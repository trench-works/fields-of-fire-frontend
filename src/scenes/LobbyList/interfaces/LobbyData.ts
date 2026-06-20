import { CharacterAssetId } from "../../../assets";

export class LobbyPlayer {
    userId!: string;
    playerId!: string;
    classId!: CharacterAssetId;
    name!: string;
}

export class LobbyData {
    id!: string;
    name?: string;
    creator!: string;
    maxPlayers!: number;
    creatorId!: string;
    players!: LobbyPlayer[];
}

export enum LobbyStatus {
    IN_GAME = "en jeu",
    OPEN = "ouvert",
}

