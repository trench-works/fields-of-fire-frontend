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
};

export class CustomContainer
    extends Phaser.GameObjects.Container
    implements Displayable
{
    private background:
        | Phaser.GameObjects.Graphics
        | Phaser.GameObjects.Image
        | null = null;
    private borderGraphics?: Phaser.GameObjects.Graphics;
    private titleText?: Phaser.GameObjects.Text;
    public onClick: (() => void) | undefined;
    private bgColor: string;
    private bgOpacity: number;
    private hoverTint: number | undefined;

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
        } = config;

        super(scene, x, y);

        this.place({ x, y }, { width, height });

        this.bgColor = bgColor; // <--- IMPORTANT
        this.bgOpacity = opacity;
        this.onClick = onClick;
        this.hoverTint = hoverTint;
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
            this.borderGraphics = scene.make.graphics({}, false);
            this.manageBorder(ColorUtils.parseColor(borderColor), borderWidth);
            this.add(this.borderGraphics);
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
                y: -this.height / 2 + 15,
            };
            this.titleText.setPosition(textPosition.x, textPosition.y);
            this.add(this.titleText);
        } else {
            this.titleText.setText(text);
        }
    }

    public manageBorder(borderColor: number, borderWidth: number) {
        if (this.borderGraphics) {
            const width = this.width;
            const height = this.height;
            this.borderGraphics.clear();
            this.borderGraphics.lineStyle(borderWidth, borderColor, 1);
            this.borderGraphics.strokeRoundedRect(
                -width / 2,
                -height / 2,
                width,
                height,
                10,
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
                10,
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
}

