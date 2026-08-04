import { BaseScene } from "../Objects";
import { Size } from "../Types";
import { GridArea, ScaleUtils } from "../Utils";
import { Displayable } from "./DisplayRoot";

export class DisplayImage implements Displayable {
    protected image: Phaser.GameObjects.Image;

    public blurred: Phaser.FX.Blur | undefined = undefined;

    constructor(
        protected readonly scene: BaseScene,
        protected area: GridArea,
    ) {
        this.image = this.scene.add.image(area.center.x, area.center.y, "");
    }

    setDepth(depth: number): this {
        this.image.setDepth(depth);
        return this;
    }

    blur(): this {
        if (!this.blurred) {
            this.blurred = this.image.postFX?.addBlur();
        }
        this.blurred?.setActive(true);
        return this;
    }

    unblur(): this {
        this.blurred?.setActive(false);
        return this;
    }

    place(area: GridArea): void {
        this.area = area;
        this.image.setDisplaySize(area.width, area.height);
        // position
        this.image.setX(this.area.center.x);
        this.image.setY(this.area.center.y);
    }

    setImage(
        texture: string,
        options?: { scale?: number; frame?: string | number },
    ): this {
        this.image.setTexture(texture, options?.frame);
        //size
        let size: Size;
        if (options?.scale) {
            size = ScaleUtils.fitFromScale(this.area, options?.scale);
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

