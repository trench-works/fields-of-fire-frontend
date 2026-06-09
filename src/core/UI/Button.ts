import Phaser from "phaser";
import { Color } from "../../config/ColorConfig";
import { FourAxis, Position, Size } from "../Types";
import { IGridArea } from "../Utils";
import { Displayable } from "./DisplayRoot";

const CLICKABLE_ALPHA = 1;
const UNCLICKABLE_ALPHA = 0.5;

type ButtonConfig = ((Position & Size & { center?: never }) | IGridArea) & {
    text?: string;
    onClick: () => void;
    fontSize?: number;
    textColor?: string;
    padding?: FourAxis;
    borderWidth?: number;
    borderColor?: string;
    image?: string;
    depth?: number;
};

export class Button
    extends Phaser.GameObjects.Container
    implements Displayable
{
    protected textDisplay?: Phaser.GameObjects.Text;
    protected imageDisplay?: Phaser.GameObjects.Image;
    protected background?: Phaser.GameObjects.Rectangle;

    protected onClick: () => void;

    protected isActivated: boolean;

    protected textColor;

    protected color = Color.btnBg;

    constructor(
        scene: Phaser.Scene,
        {
            text,
            onClick,
            image,
            fontSize,
            textColor,
            borderWidth = 0,
            depth = 1,
            padding,
            borderColor,
            ...pos
        }: ButtonConfig,
    ) {
        super(scene, pos.center?.x ?? pos.x, pos.center?.x ?? pos.y);
        this.setSize(pos.width, pos.height);
        this.setDepth(depth);

        this.onClick = onClick;
        this.isActivated = true;
        this.textColor = textColor;

        // Créer le texte du bouton

        // Ajuster la taille du conteneur par rapport au texte
        if (text) {
            this.displayText(text, { fontSize, color: textColor });
        }

        if (image) {
            this.displayImage(image);
        } else {
            this.background = scene.add.rectangle(
                0,
                0,
                this.width,
                this.height,
                Phaser.Display.Color.HexStringToColor(this.color).color,
            );
            this.add(this.background);

            if (borderWidth > 0) {
                this.background.setStrokeStyle(
                    borderWidth,
                    Phaser.Display.Color.HexStringToColor(Color.btnBorder)
                        .color,
                );
            }

            this.background.setOrigin(0.5);
            this.sendToBack(this.background);
        }

        // Défini la hitbox interactive (le "clicable")
        this.setInteractive();
        this.setScrollFactor(0);

        // Ajoute l'action
        this.setupEvents();

        // Ajoute le bouton à la scène
        scene.add.existing(this);
    }
    getObject(): Phaser.GameObjects.GameObject {
        throw new Error("Method not implemented.");
    }

    displayImage(imageKey: string | undefined): this {
        if (!imageKey) {
            this.imageDisplay?.destroy?.();
            delete this.imageDisplay;
            return this;
        }

        this.imageDisplay = this.scene.make.image(
            { x: 0, y: 0, key: imageKey },
            false,
        );
        this.imageDisplay.setDisplaySize(this.width, this.height);
        this.imageDisplay.setOrigin(0.5);

        this.addAt(this.imageDisplay);

        return this;
    }

    displayText(
        text: string | undefined,
        options?: { color?: string; fontSize?: number },
    ): this {
        if (!text) {
            this.textDisplay?.destroy?.();
            delete this.textDisplay;
            return this;
        }
        this.textDisplay = this.scene.add
            .text(0, 0, text, {
                fontFamily: "MyFont",
                fontSize: `${options?.fontSize ?? this.height / 3}px`,
                color: options?.color ?? "#FFFFFF",
            })
            .setOrigin(0.5);
        this.add(this.textDisplay);
        return this;
    }

    public setIsActivated(isActivated: boolean): this {
        this.isActivated = isActivated;
        this.setAlpha(isActivated ? CLICKABLE_ALPHA : UNCLICKABLE_ALPHA);
        this.background?.setFillStyle(
            Phaser.Display.Color.HexStringToColor(Color.btnBg).color,
        );
        return this;
    }

    public setOnClick(onClick: () => void): this {
        this.onClick = onClick;
        return this;
    }

    public setBackgroundColor(color: string) {
        this.color = color;
        this.background?.setFillStyle(
            Phaser.Display.Color.HexStringToColor(color).color,
        );
    }

    private setupEvents() {
        this.on("pointerdown", () => {
            if (this.isActivated) {
                this.onClick();
            }
        });

        this.on("pointerover", () => {
            if (this.isActivated) {
                this.background?.setFillStyle(
                    Phaser.Display.Color.HexStringToColor("#4a7eb0").color,
                );
                if (this.imageDisplay) {
                    this.imageDisplay.setTint(0xcccccc);
                }
            }
        });

        this.on("pointerout", () => {
            this.background?.setFillStyle(
                Phaser.Display.Color.HexStringToColor(Color.btnBg).color,
            );
            if (this.imageDisplay) {
                this.imageDisplay.clearTint();
            }
        });
    }
}

