import { Http } from "../../../core";
import { Game } from "../interfaces/Game";

export class GamesRepository {
    async getGames(): Promise<Game[]> {
        return Http.get<Game[]>("/games");
    }
}

