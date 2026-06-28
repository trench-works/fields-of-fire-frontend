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
    constructor(
        scene: FightScene,
        startPosition: Position,
        speed: number,
        duration: number,
    ) {
        super();
        console.log(startPosition);
        const area = GridArea.fromCenter(
            { x: startPosition.x, y: startPosition.y - 50 * scene.scaleFactor },
            {
                width: 50,
                height: 20,
            },
        );
        console.log(area);
        this.add(
            new DisplayText(scene, area)
                .setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP))
                .setText("TOAST"),
        );
        setTimeout(() => {
            this.destroy();
        }, duration);
    }
}

export class Toaster {
    constructor(protected readonly scene: FightScene) {}

    attackToast(animation: GameAttackAnimation) {
        const {
            data: { actionId, hits },
        } = animation;
        for (const hit of hits) {
            new Toast(
                this.scene,
                this.scene.gridPositions[hit.x][hit.y].pixelPosition,
                1,
                1000,
            );
        }
    }
}

