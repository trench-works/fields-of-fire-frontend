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

    setText(text: string, color: string = "#FF0000"): this {
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
            data: { actionId, hits },
        } = animation;
        await Promise.all(
            hits.map((hit) =>
                new Toast(
                    this.scene,
                    this.gridStore.gridPositions[hit.x][hit.y].pixelPosition,
                    1,
                )
                    .setText(
                        hit.damage === 0
                            ? i18n.translate("fight.actions.dodged")
                            : `${-hit.damage} ❤️`,
                        hit.damage === 0 ? "#00FF00" : "#FF0000",
                    )
                    .animate(1000),
            ),
        );
    }
}

