import { BaseScene } from "../Objects";
import { Position, Size } from "../Types";
import { ColorUtils } from "../Utils";

export class DebugRect extends Phaser.GameObjects.Container {
    constructor(scene: BaseScene, { x, y, width, height }: Size & Position) {
        super(scene, x, y);

        const debugStroke = this.scene.make.graphics({}, false);
        debugStroke.lineStyle(5, ColorUtils.parseColor("#FF0000"), 1);
        debugStroke.strokeRect(0, 0, width, height);
        debugStroke.setDepth(100000);
        this.add(debugStroke);
        scene.add.existing(this);
    }
}

