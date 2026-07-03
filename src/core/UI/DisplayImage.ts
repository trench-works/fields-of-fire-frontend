import { BaseScene } from "../Objects";
import { PlacementOrigin, Position, Size } from "../Types";
import { GridArea, ScaleUtils } from "../Utils";
import { Displayable } from "./DisplayRoot";

export class DisplayImage implements Displayable {
    protected image: Phaser.GameObjects.Image;

    constructor(
        protected readonly scene: BaseScene,
        protected readonly area: GridArea,
    ) {
        this.image = this.scene.add.image(area.center.x, area.center.y, "");
    }

    setDepth(depth: number): this {
        this.image.setDepth(depth);
        return this;
    }

    place(position: Position, size: Size, origin: PlacementOrigin): void {
        throw new Error("Method not implemented.");
    }

    setImage(texture: string, scale?: number): this {
        this.image.setTexture(texture);
        //size
        let size: Size;
        if (scale) {
            size = ScaleUtils.fitFromScale(this.area, scale);
        } else {
            size = this.area;
        }
        this.image.setDisplaySize(size.width, size.height);
        // position
        this.image.setX(this.area.center.x);
        this.image.setY(this.area.center.y);
        return this;
    }

    setAlpha(alpha?: number): this {
        this.image.setAlpha(alpha ?? 1);
        return this;
    }

    setVisible(visible: boolean): void {
        this.image.setVisible(visible);
    }

    setInteractive(interactive: boolean): this {
        this.image.setInteractive(
            interactive ? { useHandCursor: true } : false,
        );
        return this;
    }

    destroy(): void {
        this.image.destroy();
    }

    getObject(): Phaser.GameObjects.GameObject {
        return this.image;
    }

    setTint(color: number): this {
        this.image.setTint(color);
        return this;
    }

    clearTint(): this {
        this.image.clearTint();
        return this;
    }
}

