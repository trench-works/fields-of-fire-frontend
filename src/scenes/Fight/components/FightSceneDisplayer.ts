import { Displayer } from "../../../core";
import { Game } from "../../../Model/Game";
import { FightScene } from "../fight.scene";

export abstract class FightSceneDisplayer extends Displayer {
    protected game!: Game;
    declare protected scene: FightScene;

    setGame(game: Game): this {
        this.game = game;
        return this;
    }
}

