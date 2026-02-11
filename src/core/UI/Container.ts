import Phaser from "phaser";

interface ContainerConfig {
    title: string;
    bgColor?: number;
    titleColor?: string;
    x?: number;
    y?: number;
    height?: number;
    width?: number;
    borderWidth?: number;
    borderColor?: number;
    backgroundImage?: string;
    onClick?: () => void;
}

export class CustomContainer extends Phaser.GameObjects.Container {
    private background: Phaser.GameObjects.Graphics | Phaser.GameObjects.Image;
    private titleText: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, config: ContainerConfig) {
        const {
            title = "",
            bgColor = 0xffffff,
            titleColor = "#FFFFFF",
            x = scene.scale.width / 2,
            y = scene.scale.height / 2,
            height = 300,
            width = 200,
            borderWidth = 0,
            borderColor = 0xff0000,
            backgroundImage,
            onClick,
        } = config;

        super(scene, x, y);

        // --- TEXTE (créé dans la scène, c’est OK) ---
        this.titleText = scene.add
            .text(0, 0, title, {
                font: "24px Arial",
                color: titleColor,
            })
            .setOrigin(0.5);

        const minWidth = this.titleText.width + 60;
        const minHeight = this.titleText.height + 100;

        const finalWidth = Math.max(width, minWidth);
        const finalHeight = Math.max(height, minHeight);

        // --- FOND : IMAGE OU GRAPHICS ---
        if (backgroundImage) {
            // IMPORTANT : make.image => créé dans le container, pas dans la scène
            const img = scene.make.image(
                { x: 0, y: 0, key: backgroundImage },
                false,
            );
            img.setDisplaySize(finalWidth, finalHeight);
            img.setOrigin(0.5);

            this.background = img;
            this.add(img);

            // Bordure autour de l'image
            if (borderColor && borderWidth > 0) {
                const border = scene.make.graphics({}, false);
                this.manageBorder(
                    border,
                    borderColor,
                    borderWidth,
                    finalWidth,
                    finalHeight,
                );
                this.add(border);
            }
        } else {
            // Fond couleur
            const bg = scene.make.graphics({}, false);
            bg.fillStyle(bgColor);
            bg.fillRoundedRect(
                -finalWidth / 2,
                -finalHeight / 2,
                finalWidth,
                finalHeight,
                10,
            );

            this.manageBorder(
                bg,
                borderColor,
                borderWidth,
                finalWidth,
                finalHeight,
            );

            this.background = bg;
            this.add(bg);
        }

        // Position du titre
        this.titleText.setPosition(0, -finalHeight / 2 + 30);
        this.add(this.titleText);

        // Taille du container
        this.setSize(finalWidth, finalHeight);
        this.setScrollFactor(0);

        if (onClick) {
                this.setInteractive(
                    new Phaser.Geom.Rectangle(
                        -finalWidth / 2,
                        -finalHeight / 2,
                        finalWidth,
                        finalHeight,
                    ),
                    Phaser.Geom.Rectangle.Contains,
                );
                this.on("pointerdown", () => {
                    onClick();
                    console.log("Container clicked!");
                });
            }

        scene.add.existing(this);
    }

    public setTitle(newTitle: string) {
        this.titleText.setText(newTitle);
    }

    public manageBorder(
        g: Phaser.GameObjects.Graphics,
        borderColor: number,
        borderWidth: number,
        width: number,
        height: number,
    ) {
        if (borderColor && borderWidth > 0) {
            g.lineStyle(borderWidth, borderColor, 1);
            g.strokeRoundedRect(-width / 2, -height / 2, width, height, 10);
        }
    }

    public setBackgroundColor(color: number, alpha = 0.8) {
        if (this.background instanceof Phaser.GameObjects.Graphics) {
            const width = this.width;
            const height = this.height;

            this.background.clear();
            this.background.fillStyle(color, alpha);
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
