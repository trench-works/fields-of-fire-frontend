import { Game } from "../../../Model/Game";

export class GameStore {
    game!: Game;

    setGame(game: Game) {
        this.game = game;
    }
}

