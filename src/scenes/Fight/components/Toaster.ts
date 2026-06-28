import {
    Depth,
    DisplayRoot,
    DisplayText,
    GridArea,
    Position,
    UI_LEVELS_OFFSET,
} from "../../../core";
import { FightScene } from "../fight.scene";
import { GameAttackAnimation } from "../repositories/player.socket";

class Toast extends DisplayRoot {
    text: DisplayText;

    constructor(scene: FightScene, startPosition: Position, speed: number) {
        super();
        const area = GridArea.fromCenter(
            {
                x: startPosition.x,
                y: startPosition.y - 90 * scene.scaleFactor,
            },
            {
                width: 80,
                height: 30,
            },
        );
        this.text = new DisplayText(scene, area).setDepth(
            Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP),
        );
        this.add(this.text);
    }

    setText(text: string): this {
        this.text.setText(text, { color: "#FF0000" });
        return this;
    }

    async animate(duration: number) {
        setTimeout(() => {
            this.destroy();
        }, duration);
    }
}

export class Toaster {
    constructor(protected readonly scene: FightScene) {}

    async attackToast(animation: GameAttackAnimation) {
        const {
            data: { actionId, hits },
        } = animation;
        await Promise.all(
            hits.map((hit) =>
                new Toast(
                    this.scene,
                    this.scene.gridPositions[hit.x][hit.y].pixelPosition,
                    1,
                )
                    .setText(`${-hit.damage} ❤️`)
                    .animate(1000),
            ),
        );
    }
}

