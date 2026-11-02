import { Color } from "../../../config/ColorConfig";
import {
    Depth,
    DisplayRoot,
    DisplayText,
    GridArea,
    i18n,
    Position,
    UI_LEVELS_OFFSET,
} from "../../../core";
import { FightScene } from "../fight.scene";
import { GameAttackAnimation } from "../repositories/game.repository";
import { GridStore } from "../stores/grid.store";

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

    setText(text: string, color: Color = Color.RED): this {
        this.text.setText(text, { color: color });
        return this;
    }

    async animate(duration: number) {
        setTimeout(() => {
            this.destroy();
        }, duration);
    }
}

export class ToastDisplayer {
    constructor(
        private readonly scene: FightScene,
        private readonly gridStore: GridStore,
    ) {}

    async attackToast(animation: GameAttackAnimation) {
        const {
            data: { hits },
        } = animation;
        await Promise.all(
            hits.map((hit) => {
                const cell = this.gridStore.get(hit);
                if(!cell) return;
                console.log(hit.isCritical);
                
                const toast = new Toast(this.scene, cell.position, 1);

                if (hit.damage === 0) {
                    toast.setText(i18n.translate("fight.actions.dodged"), Color.GREEN);
                } else if (hit.isCritical) {
                    toast.setText(
                        `${-hit.damage} 💥`,
                        Color.RED,
                    );
                } else {
                    toast.setText(`${-hit.damage} ❤️`, Color.RED);
                }
                return toast.animate(1000)
            }),
        );
    }
}

