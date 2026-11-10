import Phaser from "phaser";
import { Color } from "../../config/ColorConfig";
import { ColorUtils, GridArea } from "../Utils";
import { Position, Size } from "../Types";
import { Displayable } from "./DisplayRoot";

function isNumber(nombre: unknown | number): nombre is number {
    return !Number.isNaN(nombre);
}

function transformNumberRadius(
    radius: number | undefined,
    size: number,
): number | undefined {
    if (!radius) {
        return undefined;
    }
    if (radius < 1) {
        return radius * size;
    }
    return radius;
}

function transformRadius(
    radius:
        | Phaser.Types.GameObjects.Graphics.RoundedRectRadius
        | number
        | undefined,
    size: number,
): Phaser.Types.GameObjects.Graphics.RoundedRectRadius | number | undefined {
    if (!radius) {
        return undefined;
    }
    if (isNumber(radius)) {
        return transformNumberRadius(radius, size);
    } else {
        return {
            bl: transformNumberRadius(radius.bl, size),
            br: transformNumberRadius(radius.br, size),
            tl: transformNumberRadius(radius.tl, size),
            tr: transformNumberRadius(radius.tr, size),
        };
    }
}

type ContainerConfig = {
    title?: string;
    bgColor?: Color;
    titleColor?: Color;
    borderWidth?: number;
    borderColor?: Color;
    backgroundImage?: string;
    opacity?: number;
    fontSize?: number;
    onClick?: () => void;
    hoverTint?: number;
    alpha?: number;
    radius?: Phaser.Types.GameObjects.Graphics.RoundedRectRadius | number;
    outterRadius?: Phaser.Types.GameObjects.Graphics.RoundedRectRadius | number;
    innerRadius?: Phaser.Types.GameObjects.Graphics.RoundedRectRadius | number;
};

const TITLE_MAX_FONT = 22;
const TITLE_MIN_FONT = 10;
const TITLE_PADDING = 10;
export class DisplayContainer
    extends Phaser.GameObjects.Container
    implements Displayable
{
    private background:
        | Phaser.GameObjects.Graphics
        | Phaser.GameObjects.Image
        | null = null;
    private border?: Phaser.GameObjects.Graphics;
    private outterBorder?: Phaser.GameObjects.Graphics;
    private titleText?: Phaser.GameObjects.Text;
    public onClick: (() => void) | undefined;
    private bgColor: Color;
    private bgOpacity: number;
    private hoverTint: number | undefined;

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

    setDepth(value: number): this {
        super.setDepth(value);
        this.background?.setDepth(value);
        this.border?.setDepth(value);
        this.outterBorder?.setDepth(value);
        this.titleText?.setDepth(value);
        return this;
    }

    blur() {
        if (!this.blurred) {
            this.blurred = this.postFX?.addBlur();
        }
        this.blurred?.setActive(true);
        return this;
    }

    unblur() {
        this.blurred?.setActive(false);
        return this;
    }

    getObject(): Phaser.GameObjects.GameObject {
        throw new Error("Method not implemented.");
    }

    place({ x, y, width, height }: Size & Position): void {
        this.setSize(width, height);
        this.setX(x + width / 2);
        this.setY(y + height / 2);
    }

    constructor(
        scene: Phaser.Scene,
        position: (Size & Position) | GridArea,
        config: ContainerConfig,
    ) {
        const { x, y, height, width } = position;
        const {
            title = "",
            bgColor = Color.MILITARY_SAND,
            borderWidth = 0,
            borderColor = Color.MILITARY_GREEN,
            backgroundImage,
            opacity = 1,
            alpha,
            onClick,
            hoverTint,
            fontSize,
            radius = 10,
            outterRadius,
            innerRadius,
        } = config;

        super(scene, x, y);

        this.place({ x, y, width, height });

        this.bgColor = bgColor; // <--- IMPORTANT
        this.bgOpacity = opacity;
        this.onClick = onClick;
        this.hoverTint = hoverTint;

        // Radius
        this.radius = radius;
        this.outterRadius = outterRadius;
        this.innerRadius = innerRadius;

        if (alpha) {
            this.alpha = alpha;
        }

        // --- TEXTE ---

        // IMPORTANT : définir la taille AVANT le fond

        // --- FOND (refactorisé) ---
        this.setText(title, { fontSize });
        this.setBackgroundImage(backgroundImage ?? null);

        // --- BORDURE ---
        if (borderColor && borderWidth > 0) {
            this.manageBorder(ColorUtils.parseColor(borderColor), borderWidth);
        }

        // --- TITRE ---

        // --- INTERACTIVITÉ ---
        if (onClick) {
            this.setInteractive();
            this.on("pointerdown", () => onClick());
        }

        // --- AJOUT DE L'ACTION ---
        this.setupEvents();

        scene.add.existing(this);
    }

    private computeTitleFontSize(text: string): number {
        const cap = Math.min(this.height / 2, TITLE_MAX_FONT);
        const fit = (this.width * 0.92) / Math.max(1, text.length * 0.55);
        return Math.max(TITLE_MIN_FONT, Math.min(cap, fit));
    }

    public setText(text: string, options?: { fontSize?: number }): this {
        const fontSize = options?.fontSize ?? this.computeTitleFontSize(text);
        if (!this.titleText) {
            this.titleText = this.scene.add
                .text(0, 0, text, {
                    fontFamily: "MyFont",
                    fontSize: fontSize,
                    color: Color.TEXT,
                })
                .setOrigin(0.5);
            this.add(this.titleText);
        } else {
            this.titleText.setText(text);
            this.titleText.setFontSize(fontSize);
        }
        // le titre reste sous le bord haut quelle que soit sa taille
        this.titleText.setPosition(0, -this.height / 2 + TITLE_PADDING + fontSize / 2);
        return this;
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
                transformRadius(this.outterRadius, Math.min(width, height)),
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
                    transformRadius(this.outterRadius, Math.min(width, height)),
                );
            }
        }
    }

    public setBackgroundColor(color: Color, alpha = 1) {
        // Sinon on met à jour le Graphics existant
        if (this.background instanceof Phaser.GameObjects.Graphics) {
            this.background
                .clear()
                .fillStyle(ColorUtils.parseColor(color), alpha);
            this.drawBackground();
        }
    }

    private drawBackground() {
        if (this.background instanceof Phaser.GameObjects.Image) {
            return;
        }

        // Sinon on met à jour le Graphics existant
        if (this.background instanceof Phaser.GameObjects.Graphics) {
            const width = this.width;
            const height = this.height;
            this.background.fillRoundedRect(
                -width / 2,
                -height / 2,
                width,
                height,
                transformRadius(
                    this.outterRadius ?? this.radius,
                    Math.min(width, height),
                ),
            );
        }
    }

    public setBackgroundImage(imageKey: string | null) {
        if (this.background) {
            this.background.destroy();
        }

        const width = this.width;
        const height = this.height;

        if (imageKey) {
            const img = this.scene.make.image(
                { x: 0, y: 0, key: imageKey },
                false,
            );
            img.setDisplaySize(width, height).setOrigin(0.5);

            this.background = img;
            this.addAt(img, 0);
        } else {
            this.background = this.scene.make
                .graphics({}, false)
                .fillStyle(ColorUtils.parseColor(this.bgColor), this.bgOpacity);
            this.drawBackground();
            this.addAt(this.background, 0);
        }
    }

    private setupEvents() {
        this.on("pointerdown", () => {
            this.onClick?.();
        });

        this.on("pointerover", () => {
            if (
                this.hoverTint !== undefined &&
                this.background instanceof Phaser.GameObjects.Image
            ) {
                this.background.setTint(this.hoverTint);
            }
        });

        this.on("pointerout", () => {
            if (this.background instanceof Phaser.GameObjects.Image) {
                this.background.clearTint();
            }
        });
    }

    public setTint(tint: number): this {
        if (this.background instanceof Phaser.GameObjects.Image) {
            this.background.setTint(tint);
        }
        return this;
    }

    public clearTint(): this {
        if (this.background instanceof Phaser.GameObjects.Image) {
            this.background.clearTint();
        }
        return this;
    }
}

