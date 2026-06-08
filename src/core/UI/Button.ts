import Phaser from "phaser";
import { Color } from "../../config/ColorConfig";
import { FourAxis, Position, Size } from "../Types";

type ButtonConfig = Position &
    Size & {
        text: string;
        onClick?: () => void;
        fontSize?: number;
        textColor?: string;
        padding?: FourAxis;
        borderWidth?: number;
        borderColor?: string;
    };

export class Button extends Phaser.GameObjects.Container {
    private buttonText: Phaser.GameObjects.Text;
    public onClick?: () => void;
    protected bg: Phaser.GameObjects.Rectangle;

    protected color = Color.btnBg;

    constructor(scene: Phaser.Scene, config: ButtonConfig) {
        const {
            x,
            y,
            width,
            height,
            text,
            onClick,
            fontSize = 20,
            textColor = "#FFFFFF",
            borderWidth = 0,
        } = config;

        super(scene, x, y);

        this.onClick = onClick;

        // Créer le texte du bouton
        this.buttonText = scene.add
            .text(0, 0, text, {
                fontFamily: "MyFont",
                fontSize: `${fontSize}px`,
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

        this.bg = scene.add.rectangle(
            0,
            0,
            this.width,
            this.height,
            Phaser.Display.Color.HexStringToColor(this.color).color,
        );
        this.add(this.bg);

        if (borderWidth > 0) {
            this.bg.setStrokeStyle(
                borderWidth,
                Phaser.Display.Color.HexStringToColor(Color.btnBorder).color,
            );
        }

        this.bg.setOrigin(0.5);
        this.sendToBack(this.bg);
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
            this.onClick?.();
        });

        this.on("pointerover", () => {
            this.bg.setFillStyle(
                Phaser.Display.Color.HexStringToColor("#4a7eb0").color,
            );
        });

        this.on("pointerout", () => {
            this.bg.setFillStyle(
                Phaser.Display.Color.HexStringToColor(Color.btnBg).color,
            );
        });
    }

    public setText(newText: string) {
        this.buttonText.setText(newText);
    }
}

