import { BaseScene, Position } from "../../../core";
import { FightScene } from "../fight.scene";
import { GameAttackAnimation } from "../repositories/player.socket";

class Toast {
    constructor(
        protected readonly scene: BaseScene,
        startPosition: Position,
        speed: number,
        duration: number,
    ) {}
}

export class Toaster {
    constructor(protected readonly scene: FightScene) {}

    attackToast(animation: GameAttackAnimation) {
        const {
            data: { actionId, hits },
        } = animation;
        for (const hit of hits) {
            new Toast(this.scene, hit, 1, 1000);
        }
    }
}

