import Phaser from "phaser";
import { Color } from "../../config/ColorConfig";
import { ColorUtils } from "../Utils";
import { Position, Size } from "../Types";

type ContainerConfig = Size &
    Position & {
        title?: string;
        bgColor?: string;
        titleColor?: string;
        borderWidth?: number;
        borderColor?: string;
        backgroundImage?: string;
        opacity?: number;
        fontSize?: number;
        onClick?: () => void;
        textPosition?: { x: number; y: number };
        hoverTint?: number;
        alpha?: number;
    };

export class CustomContainer extends Phaser.GameObjects.Container {
    private background:
        | Phaser.GameObjects.Graphics
        | Phaser.GameObjects.Image
        | null = null;
    private borderGraphics?: Phaser.GameObjects.Graphics;
    private titleText: Phaser.GameObjects.Text;
    public onClick: (() => void) | undefined;
    private bgColor: string;
    private bgOpacity: number;
    private hoverTint: number | undefined;

    constructor(scene: Phaser.Scene, config: ContainerConfig) {
        const {
            title = "",
            bgColor = Color.containerBg,
            titleColor = "#FFFFFF",
            x,
            y,
            height,
            width,
            borderWidth = 0,
            borderColor = Color.containerBorder,
            backgroundImage,
            opacity = 1,
            fontSize = 24,
            alpha,
            onClick,
            textPosition = { x: 0, y: -height / 2 + 15 },
            hoverTint,
        } = config;

        super(scene, x, y);

        this.bgColor = bgColor; // <--- IMPORTANT
        this.bgOpacity = opacity;
        this.onClick = onClick;
        this.hoverTint = hoverTint;
        if (alpha) {
            this.alpha = alpha;
        }

        // --- TEXTE ---
        this.titleText = scene.add
            .text(0, 0, title, {
                fontFamily: "MyFont",
                fontSize: fontSize,
                color: titleColor,
            })
            .setOrigin(0.5);

        // IMPORTANT : définir la taille AVANT le fond
        this.setSize(width, height);

        // --- FOND (refactorisé) ---
        this.setBackgroundImage(backgroundImage ?? null);

        // --- BORDURE ---
        if (borderColor && borderWidth > 0) {
            this.borderGraphics = scene.make.graphics({}, false);
            this.manageBorder(
                this.borderGraphics,
                ColorUtils.parseColor(borderColor),
                borderWidth,
                width,
                height,
            );
            this.add(this.borderGraphics);
        }

        // --- TITRE ---
        this.titleText.setPosition(textPosition.x, textPosition.y);
        this.add(this.titleText);

        // --- INTERACTIVITÉ ---
        if (onClick) {
            this.setInteractive();
            this.on("pointerdown", () => onClick());
        }

        // --- AJOUT DE L'ACTION ---
        this.setupEvents();

        scene.add.existing(this);
    }

    public manageBorder(
        g: Phaser.GameObjects.Graphics,
        borderColor: number,
        borderWidth: number,
        width: number,
        height: number,
    ) {
        g.clear();
        g.lineStyle(borderWidth, borderColor, 1);
        g.strokeRoundedRect(-width / 2, -height / 2, width, height, 10);
    }

    public setBackgroundColor(color: string, alpha = 1) {
        // Si le fond actuel est une image → on repasse en mode couleur
        if (this.background instanceof Phaser.GameObjects.Image) {
            this.setBackgroundImage(null);
            return;
        }

        // Sinon on met à jour le Graphics existant
        if (this.background instanceof Phaser.GameObjects.Graphics) {
            const width = this.width;
            const height = this.height;

            this.background.clear();
            this.background.fillStyle(ColorUtils.parseColor(color), alpha);
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
            const bg = this.scene.make.graphics({}, false);
            bg.fillStyle(ColorUtils.parseColor(this.bgColor), this.bgOpacity);
            bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10);

            this.background = bg;
            this.addAt(bg, 0);
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

    public setTitle(newTitle: string) {
        this.titleText.setText(newTitle);
        this.titleText.setPosition(0, -this.height / 2 + 15);
    }
}

