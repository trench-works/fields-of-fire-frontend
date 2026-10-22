import Phaser from "phaser";
import { Color } from "../../config/ColorConfig";
import { FourAxis, PlacementOrigin, Position, Size } from "../Types";
import { Displayable } from "./DisplayRoot";
import { DisplayText } from "./DisplayText";
import { BaseScene } from "../Objects";
import { ColorUtils, GridArea } from "../Utils";
import { DisplayImage } from "./DisplayImage";

const CLICKABLE_ALPHA = 1;
const UNCLICKABLE_ALPHA = 0.5;

type ButtonConfig = {
    text?: string;
    onClick: () => void;
    fontSize?: number;
    textColor?: Color;
    bgColor?: Color;
    padding?: FourAxis;
    borderWidth?: number;
    borderColor?: Color;
    image?: string;
    depth?: number;
    radius?: Phaser.Types.GameObjects.Graphics.RoundedRectRadius | number;
    outterRadius?: Phaser.Types.GameObjects.Graphics.RoundedRectRadius | number;
    innerRadius?: Phaser.Types.GameObjects.Graphics.RoundedRectRadius | number;
};

export class Button
    extends Phaser.GameObjects.Container
    implements Displayable
{
    declare scene: BaseScene;
    protected textDisplay?: DisplayText;
    protected imageDisplay?: DisplayImage;
    protected background?: Phaser.GameObjects.Graphics;
    private border?: Phaser.GameObjects.Graphics;
    private outterBorder?: Phaser.GameObjects.Graphics;

    private highlighter?: Phaser.GameObjects.Graphics;

    protected onClick: () => void;

    protected isActivated: boolean;

    protected textColor: Color | undefined;

    protected color: Color;
    protected borderColor: Color;

    public blurred: Phaser.FX.Blur | undefined = undefined;

    protected radius:
        | Phaser.Types.GameObjects.Graphics.RoundedRectRadius
        | number;
    public outterRadius?:
        | Phaser.Types.GameObjects.Graphics.RoundedRectRadius
        | number;
    protected innerRadius?:
        | Phaser.Types.GameObjects.Graphics.RoundedRectRadius
        | number;

    constructor(
        scene: BaseScene,
        protected readonly area: Position & Size,
        {
            text,
            onClick,
            image,
            fontSize,
            textColor,
            bgColor,
            borderColor,
            borderWidth = 0,
            depth = 1,
            radius = 0,
            outterRadius,
            innerRadius,
        }: ButtonConfig,
    ) {
        super(scene, area.x + area.width / 2, area.y + area.height / 2);
        this.scene = scene;
        this.setSize(area.width, area.height);
        this.setDepth(depth);

        // Radius
        this.radius = radius;
        this.outterRadius = outterRadius;
        this.innerRadius = innerRadius;

        this.onClick = onClick;
        this.isActivated = true;
        this.textColor = textColor;
        this.color = bgColor ?? Color.MILITARY_GREEN;
        this.borderColor = borderColor ?? Color.MILITARY_GREEN;

        // --- BORDURE ---
        if (borderWidth > 0) {
            this.manageBorder(
                ColorUtils.parseColor(this.borderColor),
                borderWidth,
            );
        }

        // Créer le texte du bouton

        // Ajuster la taille du conteneur par rapport au texte
        if (text) {
            this.displayText(text, { fontSize, color: textColor });
        }

        if (image) {
            this.displayImage(image);
        } else {
            this.background = this.scene.make.graphics({}, false);
            this.add(this.background);
            this.setBackgroundColor();
            this.bringToTop(this.background);
            if (this.textDisplay) {
                this.bringToTop(this.textDisplay.getObject());
            }
        }

        // Défini la hitbox interactive (le "clicable")
        this.setInteractive();
        this.setScrollFactor(0);

        // Ajoute l'action
        this.setupEvents();

        // Ajoute le bouton à la scène
        scene.add.existing(this);
    }
    public manageBorder(borderColor: number, borderWidth: number) {
        if (!this.border) {
            this.border = this.scene.make.graphics({}, false);
            this.add(this.border);
        }
        const width = this.width;
        const height = this.height;
        this.border.clear().lineStyle(borderWidth, borderColor, 1);
        if ((this.innerRadius ?? this.radius) === 0) {
            this.border.strokeRect(-width / 2, -height / 2, width, height);
        } else {
            this.border.strokeRoundedRect(
                -width / 2,
                -height / 2,
                width,
                height,
                this.outterRadius,
            );
        }
        if (this.outterRadius !== undefined) {
            if (!this.outterBorder) {
                this.outterBorder = this.scene.make.graphics({}, false);
                this.add(this.outterBorder);
            }
            const width = this.width;
            const height = this.height;
            this.outterBorder.clear().lineStyle(borderWidth, borderColor, 1);
            if (this.outterRadius === 0) {
                this.outterBorder.strokeRect(
                    -width / 2,
                    -height / 2,
                    width,
                    height,
                );
            } else {
                this.outterBorder.strokeRoundedRect(
                    -width / 2,
                    -height / 2,
                    width,
                    height,
                    this.outterRadius,
                );
            }
        }
    }

    setDepth(value: number): this {
        super.setDepth(value);
        this.imageDisplay?.setDepth(value);
        this.border?.setDepth(value);
        this.outterBorder?.setDepth(value);
        this.textDisplay?.setDepth(value);
        this.background?.setDepth(value);
        return this;
    }

    blur() {
        if (!this.blurred) {
            this.blurred = this.postFX?.addBlur();
        }
        this.blurred?.setActive(true);
        this.imageDisplay?.blur();
        return this;
    }

    unblur() {
        this.blurred?.setActive(false);
        this.imageDisplay?.unblur();
        return this;
    }

    hightlight(highlight: boolean): this {
        if (highlight) {
            if (!this.highlighter) {
                this.highlighter = this.scene.make.graphics({}, false);
                this.add(this.highlighter);
            }
            const width = this.width;
            const height = this.height;
            this.highlighter.clear();
            this.highlighter.lineStyle(
                2,
                ColorUtils.parseColor(Color.HIGHLIGHT),
                1,
            );
            this.highlighter.strokeRect(-width / 2, -height / 2, width, height);
        } else {
            this.highlighter?.destroy();
            this.highlighter = undefined;
        }
        return this;
    }

    place(area: Position & Size, origin: PlacementOrigin): void {
        throw new Error("Method not implemented.");
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

        this.background?.destroy();

        this.imageDisplay = new DisplayImage(
            this.scene,
            new GridArea(
                this.area.x,
                this.area.y,
                this.area.width,
                this.area.height,
            ),
        ).setImage(imageKey);

        return this;
    }

    displayText(
        text: string | undefined,
        options?: { color?: Color; fontSize?: number },
    ): this {
        this.textDisplay?.destroy?.();
        if (!text) {
            delete this.textDisplay;
            return this;
        }
        this.textDisplay = new DisplayText(this.scene, {
            x: -this.width / 2,
            y: -this.height / 2,
            width: this.width,
            height: this.height,
        }).setText(text, {
            fontSize:
                options?.fontSize ??
                Math.min(this.height / 3, (this.width / text.length) * 1.5),
            color: options?.color ?? Color.TEXT,
        });
        this.add(this.textDisplay.getObject());
        return this;
    }

    public setIsActivated(isActivated: boolean): this {
        this.isActivated = isActivated;
        this.setAlpha(isActivated ? CLICKABLE_ALPHA : UNCLICKABLE_ALPHA);
        this.imageDisplay?.setAlpha(
            isActivated ? CLICKABLE_ALPHA : UNCLICKABLE_ALPHA,
        );
        this.setBackgroundColor();
        return this;
    }

    public setOnClick(onClick: () => void): this {
        this.onClick = onClick;
        return this;
    }

    public setBackgroundColor(
        color?: Color,
        options?: { isTemporary?: boolean },
    ) {
        if (!options?.isTemporary && color) {
            this.color = color;
        }
        this.background?.fillStyle(ColorUtils.parseColor(color ?? this.color));
        this.background?.fillRoundedRect(
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height,
            this.outterRadius ?? this.radius,
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
                this.setBackgroundColor(Color.HIGHTLIGHT_HOVER, {
                    isTemporary: true,
                });
                if (this.imageDisplay) {
                    this.imageDisplay.setTint(0xcccccc);
                }
            }
        });

        this.on("pointerout", () => {
            this.setBackgroundColor();
            if (this.imageDisplay) {
                this.imageDisplay.clearTint();
            }
        });
    }

    setText(
        text: string,
        options?: { color?: Color; fontSize?: number },
    ): this {
        this.displayText(text, options);
        return this;
    }

    setImage(imageKey: string): this {
        this.imageDisplay?.setImage(imageKey);
        return this;
    }
}

