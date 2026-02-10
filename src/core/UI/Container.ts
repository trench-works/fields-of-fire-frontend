import Phaser from "phaser";

interface ContainerConfig {
    title: string;
    bgColor?: number;
    titleColor?: string;
    x?: number;
    y?: number;
    height?: number;
    width?: number;
    borderColor?: number;
}

export class CustomContainer extends Phaser.GameObjects.Container {
    private background: Phaser.GameObjects.Graphics;
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
            borderColor = 0xff0000,
        } = config;

        super(scene, x, y);

        // Fond
        this.background = scene.add.graphics();
        this.add(this.background);
        this.background.fillStyle(bgColor);

        // Texte pour mesure
        this.titleText = scene.add.text(0, 0, title, {
            font: "24px Arial",
            color: titleColor,
        }).setOrigin(0.5);

        // Calcul largeur/hauteur minimales
        const minWidth = this.titleText.width + 60;
        const minHeight = this.titleText.height + 100;

        const finalWidth = Math.max(width, minWidth);
        const finalHeight = Math.max(height, minHeight);

        // Dessiner le fond
        this.background.fillRoundedRect(
            -finalWidth / 2,
            -finalHeight / 2,
            finalWidth,
            finalHeight,
            10
        );

        // Bordure
        if (borderColor) {
            this.background.lineStyle(4, borderColor, 1);
            this.background.strokeRoundedRect(
                -finalWidth / 2,
                -finalHeight / 2,
                finalWidth,
                finalHeight,
                10
            );
        }

        // Positionner le texte
        this.titleText.setPosition(0, -finalHeight / 2 + 30);

        // Ajouter les éléments au container
        this.add([this.background, this.titleText]);

        // Taille du container pour interaction
        this.setSize(finalWidth, finalHeight);

        // Rendre fixe à la caméra si nécessaire
        this.setScrollFactor(0);

        // Ajouter le container à la scène
        scene.add.existing(this);
    }

    // Méthode pour changer le titre
    public setTitle(newTitle: string) {
        this.titleText.setText(newTitle);
    }

    // Méthode pour changer la couleur du fond
    public setBackgroundColor(color: number, alpha = 0.8) {
        const width = this.width;
        const height = this.height;

        this.background.clear();
        this.background.fillStyle(color, alpha);
        this.background.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
    }
}
