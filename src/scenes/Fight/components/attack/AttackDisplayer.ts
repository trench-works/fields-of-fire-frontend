import { BaseScene, Displayer } from "../../../../core";
import { Game } from "../../../../Model/Game";
import { GameAttackAnimation } from "../../repositories/player.socket";
import { ParticleDisplayer } from "../Particle/ParticleDisplayer";

export class AttackDisplayer extends Displayer {
    protected readonly particleDisplayer: ParticleDisplayer;

    constructor(scene: BaseScene) {
        super(scene);
        this.particleDisplayer = new ParticleDisplayer(scene);
    }

    async animate(
        animation: GameAttackAnimation,
        newGame: Game,
    ): Promise<this> {
        console.log("ATTACK", animation.data);
        switch (animation.data.actionId) {
            case "intimidation":
                await this.particleDisplayer.animate();
                break;
        }
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

