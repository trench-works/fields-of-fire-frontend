import Phaser from "phaser";
import { Color } from "../../config/ColorConfig";
import { ColorUtils, GridArea } from "../Utils";
import { Position, Size } from "../Types";
import { Displayable } from "./DisplayRoot";

type ContainerConfig = {
    title?: string;
    bgColor?: string;
    titleColor?: string;
    borderWidth?: number;
    borderColor?: string;
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
    private bgColor: string;
    private bgOpacity: number;
    private hoverTint: number | undefined;

    protected radius:
        | Phaser.Types.GameObjects.Graphics.RoundedRectRadius
        | number;
    public outterRadius?:
        | Phaser.Types.GameObjects.Graphics.RoundedRectRadius
        | number;
    protected innerRadius?:
        | Phaser.Types.GameObjects.Graphics.RoundedRectRadius
        | number;

    getObject(): Phaser.GameObjects.GameObject {
        throw new Error("Method not implemented.");
    }

    place({ x, y }: Position, { width, height }: Size): void {
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
            bgColor = Color.containerBg,
            borderWidth = 0,
            borderColor = Color.containerBorder,
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

        this.place({ x, y }, { width, height });

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

    public setText(text: string, options?: { fontSize?: number }) {
        const fontSize =
            options?.fontSize ??
            Math.min(this.height / 2, (this.width / text.length) * 1.5);
        if (!this.titleText) {
            this.titleText = this.scene.add
                .text(0, 0, text, {
                    fontFamily: "MyFont",
                    fontSize: fontSize,
                    color: "#FFFFFF",
                })
                .setOrigin(0.5);
            const textPosition = {
                x: 0,
                y: -this.height / 2 + 22,
            };
            this.titleText.setPosition(textPosition.x, textPosition.y);
            this.add(this.titleText);
        } else {
            this.titleText.setText(text);
        }
    }

    public manageBorder(borderColor: number, borderWidth: number) {
        if (!this.border) {
            this.border = this.scene.make.graphics({}, false);
            this.add(this.border);
        }
        const width = this.width;
        const height = this.height;
        this.border.clear();
        this.border.lineStyle(borderWidth, borderColor, 1);
        this.border.strokeRoundedRect(
            -width / 2,
            -height / 2,
            width,
            height,
            this.innerRadius ?? this.radius,
        );
        if (this.outterRadius !== undefined) {
            if (!this.outterBorder) {
                this.outterBorder = this.scene.make.graphics({}, false);
                this.add(this.outterBorder);
            }
            const width = this.width;
            const height = this.height;
            this.outterBorder.clear();
            this.outterBorder.lineStyle(borderWidth, borderColor, 1);
            this.outterBorder.strokeRoundedRect(
                -width / 2,
                -height / 2,
                width,
                height,
                this.outterRadius,
            );
        }
    }

    public setBackgroundColor(color: string, alpha = 1) {
        // Sinon on met à jour le Graphics existant
        if (this.background instanceof Phaser.GameObjects.Graphics) {
            this.background.clear();
            this.background.fillStyle(ColorUtils.parseColor(color), alpha);
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
                this.outterRadius ?? this.radius,
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
            img.setDisplaySize(width, height);
            img.setOrigin(0.5);

            this.background = img;
            this.addAt(img, 0);
        } else {
            this.background = this.scene.make.graphics({}, false);
            this.background.fillStyle(
                ColorUtils.parseColor(this.bgColor),
                this.bgOpacity,
            );
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

