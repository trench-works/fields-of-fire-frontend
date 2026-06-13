import { BaseScene } from "../Objects";
import { Size, Position, PlacementOrigin } from "../Types";
import { Displayable } from "./DisplayRoot";

export class DisplayText implements Displayable {
    protected text: Phaser.GameObjects.Text;

    constructor(
        protected readonly scene: BaseScene,
        protected readonly area: Position & Size,
    ) {
        this.text = this.scene.add
            .text(area.x + area.width / 2, area.y + area.height / 2, "", {
                fontFamily: "MyFont",
                fontSize: `${0}px`,
                color: "#FFFFFF",
            })
            .setOrigin(0.5);
    }

    place(position: Position, size: Size, origin: PlacementOrigin): void {
        throw new Error("Method not implemented.");
    }

    setText(
        text: string,
        options?: { color?: string; fontSize?: number },
    ): this {
        const fontSize = Math.min(
            this.area.height / 2,
            (this.area.width / text.length) * 1.5,
        );
        this.text.setText(text);
        this.text.setFontSize(`${options?.fontSize ?? fontSize}px`);
        this.text.setColor(options?.color ?? "#FFFFFF");
        return this;
    }

    setVisible(visible: boolean): void {
        this.text.setVisible(visible);
    }

    destroy(): void {
        this.text.destroy();
    }

    getObject(): Phaser.GameObjects.GameObject {
        return this.text;
    }

    setDepth(depth: number): this {
        this.text.setDepth(depth);
        return this;
    }
}

