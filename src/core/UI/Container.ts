import Phaser from "phaser";
import { Color } from "../../data/ColorConfig";
import { parseColor } from "../Utils";

interface ContainerConfig {
    title: string;
    bgColor?: string;
    titleColor?: string;
    x?: number;
    y?: number;
    height?: number;
    width?: number;
    borderWidth?: number;
    borderColor?: string;
    backgroundImage?: string;
    opacity?: number;
    fontsize?: number;
    onClick?: () => void;
}

export class CustomContainer extends Phaser.GameObjects.Container {
    private background:
        | Phaser.GameObjects.Graphics
        | Phaser.GameObjects.Image
        | null = null;
    private borderGraphics?: Phaser.GameObjects.Graphics;
    private titleText: Phaser.GameObjects.Text;
    private bgColor: string;
    private bgOpacity: number;

    constructor(scene: Phaser.Scene, config: ContainerConfig) {
        const {
            title = "",
            bgColor = Color.containerBg,
            titleColor = "#FFFFFF",
            x = scene.scale.width / 2,
            y = scene.scale.height / 2,
            height = 300,
            width = 200,
            borderWidth = 0,
            borderColor = Color.containerBorder,
            backgroundImage,
            opacity = 1,
            fontsize = 24,
            onClick,
        } = config;

        super(scene, x, y);

        this.bgColor = bgColor; // <--- IMPORTANT
        this.bgOpacity = opacity;

        // --- TEXTE ---
        this.titleText = scene.add
            .text(0, 0, title, {
                font: `${fontsize}px Arial`,
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
                parseColor(borderColor),
                borderWidth,
                width,
                height,
            );
            this.add(this.borderGraphics);
        }

        // --- TITRE ---
        this.titleText.setPosition(0, -height / 2 + 15);
        this.add(this.titleText);

        // --- INTERACTIVITÉ ---
        if (onClick) {
            this.setInteractive();
            this.on("pointerdown", () => onClick());
        }

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
            this.background.fillStyle(parseColor(color), alpha);
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
            bg.fillStyle(parseColor(this.bgColor), this.bgOpacity);
            bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10);

            this.background = bg;
            this.addAt(bg, 0);
        }
    }

    public setTitle(newTitle: string) {
        this.titleText.setText(newTitle);
        this.titleText.setPosition(0, -this.height / 2 + 15);
    }
}
