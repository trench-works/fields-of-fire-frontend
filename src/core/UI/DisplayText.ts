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
        const minSize = Math.min(
            this.area.height / 1.5,
            (this.area.width / text.length) * 1.5,
        );

        const fontSize = Math.max(minSize, 13);
        this.text.setText(text);
        this.text.setFontSize(`${options?.fontSize ?? fontSize}px`);
        this.text.setColor(options?.color ?? "#FFFFFF");
        return this;
    }

    setDescription(text: string, options?: { color?: string; fontSize?: number }): this {
        this.text.setWordWrapWidth(this.area.width, true);
        
        if (options?.fontSize) {
            this.text.setFontSize(`${options.fontSize}px`);
        } else {
            // FontSize temporaire pour calculer le nombre de lignes
            this.text.setFontSize("16px");
            this.text.setText(text);
            
            const lines = this.text.getWrappedText(text);
            const lineCount = lines.length || 1;
            
            // Taille automatique basée sur la hauteur disponible
            const minSize = Math.min(
                this.area.height / (lineCount * 1.5) , // 80% de la hauteur par ligne
                this.area.width / 20,               // contrainte horizontale
                32,                                 // taille max
            );

            const fontSize = Math.max(minSize, 11);
            console.log("ligneCount",lineCount)
            this.text.setFontSize(`${fontSize}px`);
        }

        this.text.setColor(options?.color ?? "#FFFFFF");
        this.text.setOrigin(0, 0);
        this.text.setPosition(this.area.x, this.area.y);
        this.text.setText(text);
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

