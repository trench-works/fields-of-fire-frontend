import { Position, Size } from "../Types";
import { ColorUtils, GridArea } from "../Utils";
import { Displayable } from "./DisplayRoot";

type BlurConfig = {
    radius?: Phaser.Types.GameObjects.Graphics.RoundedRectRadius | number;
    depth?: number;
};

export class Blur extends Phaser.GameObjects.Container implements Displayable {
    private background: Phaser.GameObjects.Graphics;

    getObject(): Phaser.GameObjects.GameObject {
        return this.background;
    }

    constructor(
        scene: Phaser.Scene,
        { x, y, height, width }: (Size & Position) | GridArea,
        { radius = 10, depth = 0 }: BlurConfig,
    ) {
        super(scene, x, y);

        this.place({ x, y }, { width, height });

        // Radius

        this.background = this.scene.make.graphics({}, false);
        this.background.fillStyle(ColorUtils.parseColor("#000000"), 0.1);
        this.background.setDepth(depth);
        this.background.fillRoundedRect(
            -width / 2,
            -height / 2,
            width,
            height,
            radius,
        );
        this.addAt(this.background, 0);

        scene.add.existing(this);
    }

    place({ x, y }: Position, { width, height }: Size): void {
        this.setSize(width, height);
        this.setX(x + width / 2);
        this.setY(y + height / 2);
    }
}

