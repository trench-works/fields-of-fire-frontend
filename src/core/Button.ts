import Phaser from "phaser";

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
    onClick: () => void;
    fontSize?: string;
    textColor?: string;
    padding?: ButtonPadding;
}

export class Button extends Phaser.GameObjects.Container {
    private buttonText: Phaser.GameObjects.Text;
    private color: string;
    private onClick: () => void;

    constructor(scene: Phaser.Scene, config: ButtonConfig) {
        const {
            x = 0,
            y = 0,
            text,
            color = "#000000",
            onClick,
            fontSize = "20px",
            textColor = "#FFFFFF",
            padding = { left: 15, right: 15, top: 10, bottom: 10 },
        } = config;

        super(scene, x, y);

        this.color = color;
        this.onClick = onClick;

        // Créer le texte du bouton
        this.buttonText = scene.add
            .text(0, 0, text, {
                font: `${fontSize} Arial`,
                color: textColor,
                backgroundColor: color,
                padding: padding,
            })
            .setOrigin(0.5);

        this.add(this.buttonText);

        // Ajuster la taille du conteneur par rapport au texte
        const btnPadding = 20;
        this.setSize(
            this.buttonText.width + btnPadding * 2,
            this.buttonText.height + btnPadding
        );

        // Défini la hitbox interactive (le "clicable")
        const hitArea = new Phaser.Geom.Rectangle(
            0,
            0,
            this.width,
            this.height
        );
        this.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
        this.setScrollFactor(0);

        // Ajoute l'action
        this.setupEvents();

        // Ajoute le bouton à la scène
        scene.add.existing(this);
    }

    private setupEvents() {
        this.on("pointerdown", () => {
            console.log("Button clicked!");
            this.onClick();
        });

        this.on("pointerover", () => {
            console.log("Hover over button");
            this.buttonText.setStyle({ backgroundColor: "#cc0000" });
        });

        this.on("pointerout", () => {
            console.log("Hover out button");
            this.buttonText.setStyle({ backgroundColor: this.color });
        });
    }

    public setText(newText: string) {
        this.buttonText.setText(newText);
    }
}
