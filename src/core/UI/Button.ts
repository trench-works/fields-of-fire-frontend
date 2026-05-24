import Phaser from "phaser";
import { Color } from "../../config/ColorConfig";

interface ButtonPadding {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

interface ButtonConfig {
    x?: number;
    y?: number;
    text: string;
    color?: string;
    onClick?: () => void;
    fontSize?: string;
    textColor?: string;
    padding?: ButtonPadding;
    height?: number;
    width?: number;
    borderWidth?: number;
    borderColor?: string;
    colorOnOver?: string;
}

export class Button extends Phaser.GameObjects.Container {
    private buttonText: Phaser.GameObjects.Text;
    private color: string;
    private hoverColor: string | null;
    public onClick?: () => void;
    private bg: Phaser.GameObjects.Rectangle;

    constructor(scene: Phaser.Scene, config: ButtonConfig) {
        const {
            x = 0,
            y = 0,
            text,
            color = Color.btnBg,
            onClick,
            fontSize = "20px",
            textColor = "#FFFFFF",
            borderWidth = 0,
            borderColor = Color.btnBorder,
            colorOnOver = "#4a7eb0",
            //padding = { left: 15, right: 15, top: 10, bottom: 10 },
        } = config;

        super(scene, x, y);

        this.color = color;
        this.hoverColor = colorOnOver;
        this.onClick = onClick;

        // Créer le texte du bouton
        this.buttonText = scene.add
            .text(0, 0, text, {
                font: `${fontSize} Arial`,
                color: textColor,
            })
            .setOrigin(0.5);

        this.add(this.buttonText);

        // Ajuster la taille du conteneur par rapport au texte
        if (!config.width || !config.height) {
            const btnPadding = 20;
            this.setSize(
                this.buttonText.width + btnPadding * 2,
                this.buttonText.height + btnPadding,
            );
        } else {
            this.setSize(config.width, config.height);
        }

        const bg = scene.add.rectangle(
            0,
            0,
            this.width,
            this.height,
            Phaser.Display.Color.HexStringToColor(color).color,
        );

        if (borderWidth > 0) {
            bg.setStrokeStyle(
                borderWidth,
                Phaser.Display.Color.HexStringToColor(borderColor).color,
            );
        }

        this.bg = bg;
        this.add(bg);
        bg.setOrigin(0.5);
        this.sendToBack(bg);
        // Défini la hitbox interactive (le "clicable")
        const hitArea = new Phaser.Geom.Rectangle(
            0,
            0,
            this.width,
            this.height,
        );
        this.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
        this.setScrollFactor(0);

        // Ajoute l'action
        this.setupEvents();

        // Ajoute le bouton à la scène
        scene.add.existing(this);
    }

    public setBackgroundColor(color: string) {
        this.color = color;
        this.bg.setFillStyle(
            Phaser.Display.Color.HexStringToColor(color).color,
        );
    }

    private setupEvents() {
        this.on("pointerdown", () => {
            //console.log("Button clicked!");
            this.onClick?.();
        });

        this.on("pointerover", () => {
            //console.log("Hover over button");
            if (this.hoverColor) {
                this.bg.setFillStyle(
                    Phaser.Display.Color.HexStringToColor(this.hoverColor)
                        .color,
                );
            }
        });

        this.on("pointerout", () => {
            //console.log("Hover out button");
            this.bg.setFillStyle(
                Phaser.Display.Color.HexStringToColor(this.color).color,
            );
        });
    }

    public setText(newText: string) {
        this.buttonText.setText(newText);
    }
}

