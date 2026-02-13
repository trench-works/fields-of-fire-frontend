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
    onClick?: () => void;
}

export class CustomContainer extends Phaser.GameObjects.Container {
    private background: Phaser.GameObjects.Graphics | Phaser.GameObjects.Image;
    private borderGraphics?: Phaser.GameObjects.Graphics;
    private titleText: Phaser.GameObjects.Text;

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
            onClick,
        } = config;

        super(scene, x, y);

        // --- TEXTE ---
        this.titleText = scene.add
            .text(0, 0, title, {
                font: "24px Arial",
                color: titleColor,
            })
            .setOrigin(0.5);

        const minWidth = this.titleText.width + 60;
        const minHeight = this.titleText.height + 100;

        const finalWidth = Math.max(width, minWidth);
        const finalHeight = height;

        // --- FOND ---
        if (backgroundImage) {
            const img = scene.make.image(
                { x: 0, y: 0, key: backgroundImage },
                false,
            );
            img.setDisplaySize(finalWidth, finalHeight);
            img.setOrigin(0.5);
            this.background = img;
            this.add(img);
        } else {
            const bg = scene.make.graphics({}, false);
            bg.fillStyle(parseColor(bgColor));
            bg.fillRoundedRect(
                -finalWidth / 2,
                -finalHeight / 2,
                finalWidth,
                finalHeight,
                10,
            );
            this.background = bg;
            this.add(bg);
        }

        // --- BORDURE ---
        if (borderColor && borderWidth > 0) {
            this.borderGraphics = scene.make.graphics({}, false);
            this.manageBorder(
                this.borderGraphics,
                parseColor(borderColor),
                borderWidth,
                finalWidth,
                finalHeight,
            );
            this.add(this.borderGraphics);
        }

        // --- TITRE ---
        this.titleText.setPosition(0, -finalHeight / 2 + 30);
        this.add(this.titleText);

        // --- TAILLE DU CONTAINER ---
        this.setSize(finalWidth, finalHeight);

        // --- INTERACTIVITÉ (correcte et alignée) ---
        if (onClick) {
            this.setInteractive(); // <-- LA SOLUTION
            this.on("pointerdown", () => {
                console.log("Container clicked!");
                onClick();
            });
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

    public setBackgroundColor(color: string, alpha = 0.8) {
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
}
