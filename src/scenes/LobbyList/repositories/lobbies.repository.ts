import { Http } from "../../../core";
import { LobbyData } from "../interfaces/LobbyData";

export class LobbiesRepository {
    async getLobbies(): Promise<LobbyData[]> {
        return Http.get<LobbyData[]>("/lobbies");
    }
}

