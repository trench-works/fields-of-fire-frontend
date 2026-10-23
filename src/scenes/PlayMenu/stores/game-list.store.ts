import { Game } from "../interfaces/Game";

type CurrentGame = {
    gameId: string;
    players: { playerId: string; classId: string; userId: string }[];
};
export class GameListStore {
    games: Game[];
    currentGame: CurrentGame | null = null;
    selectedGameId: string | null;

    constructor() {
        this.games = [];
        this.selectedGameId = null;
    }

    setGames(games: Game[]): void {
        this.games = games.reverse();
    }

    setSelectedGameId(gameId: string | null): void {
        this.selectedGameId = gameId;
    }

    setCurrentGame(game: CurrentGame): void {
        this.currentGame = game;
    }

    getCurrentGame(gameId: string): Game | undefined {
        return this.games.find((game) => game.id === gameId);
    }
}

