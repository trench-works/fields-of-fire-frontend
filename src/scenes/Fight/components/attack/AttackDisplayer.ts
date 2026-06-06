import { Game } from "../../../../Model/Game";
import { GameAttackAnimation } from "../../repositories/player.socket";
import { FightSceneDisplayer } from "../FightSceneDisplayer";

export class AttackDisplayer extends FightSceneDisplayer {
    async animate(
        animation: GameAttackAnimation,
        newGame: Game,
    ): Promise<this> {
        return this;
    }

    preRender(): this {
        return this;
    }
    render(): this {
        return this;
    }
    update(): this {
        return this;
    }
}

