import Phaser from "phaser";
import { CustomContainer, GridUtils } from "../../core";
import {
    BackgroundAsset,
    BackgroundAssetId,
} from "../../assets/BackgroundAsset";

export class MainMenu extends Phaser.Scene {
    private readonly BUTTON_WIDTH = 500;
    private readonly BUTTON_HEIGHT = 100;
    private sceneGrid = GridUtils.uiGrid(0, 0);

    constructor() {
        super({ key: "mainMenuScene" });
    }

    preload() {
        // Charger les images nécessaires
        BackgroundAsset.load(this.load, BackgroundAssetId.MAIN_MENU);
        this.load.image("menuBalle", "assets/menuBalle.png");
    }

    create() {
        // Ajouter l'image de fond qui prend toute la page
        const bgImage = this.add.image(
            this.scale.width / 2,
            this.scale.height / 2,
            BackgroundAsset.getAssetKey(BackgroundAssetId.MAIN_MENU)
        );
        bgImage.setDisplaySize(this.scale.width, this.scale.height);
        bgImage.setOrigin(0.5);

        // Créer un titre du menu
        this.add
            .text(this.scale.width / 2, 200, "Les Mémoires Oubliées", {
                font: "72px Arial",
                color: "#FFFFFF",
            })
            .setOrigin(0.5);

        // Zone des boutons (centrer verticalement: colonne 2-7, ligne 3-6)
        const buttonsArea = this.sceneGrid.getArea(4.5, 3, 0, 15);

        // Créer une grille interne pour les boutons (3 boutons: 1 colonne, 3 lignes)
        const buttonsGrid = GridUtils.uiGrid(
            0,
            0,
            buttonsArea.width,
            buttonsArea.height
        );

        // Bouton Jouer (ligne 0)
        const playArea = buttonsGrid.getArea(0, 0, 1, 1);
        new CustomContainer(this, {
            title: "Jouer",
            x: buttonsArea.x + playArea.centerX,
            y: buttonsArea.y + playArea.centerY,
            width: this.BUTTON_WIDTH,
            height: this.BUTTON_HEIGHT,
            backgroundImage: "menuBalle",
            titleColor: "#FFFFFF",
            fontsize: 50,
            textPosition: { x: -130, y: -10 },
            hoverTint: 0xcccccc,
            onClick: () => {
                this.scene.start("lobbyScene");
            },
        });

        // Bouton Paramètres (ligne 1)
        const settingsArea = buttonsGrid.getArea(0, 1, 1, 1);
        new CustomContainer(this, {
            title: "Paramètres",
            x: buttonsArea.x + settingsArea.centerX,
            y: buttonsArea.y + settingsArea.centerY,
            width: this.BUTTON_WIDTH,
            height: this.BUTTON_HEIGHT,
            backgroundImage: "menuBalle",
            titleColor: "#FFFFFF",
            fontsize: 50,
            textPosition: { x: -70, y: -10 },
            hoverTint: 0xcccccc,
            onClick: () => {
                console.log("Paramètres - À implémenter");
            },
        });

        // Bouton Lobby (ligne 2)
        const lobbyArea = buttonsGrid.getArea(0, 2, 1, 1);
        new CustomContainer(this, {
            title: "Lobby",
            x: buttonsArea.x + lobbyArea.centerX,
            y: buttonsArea.y + lobbyArea.centerY,
            width: this.BUTTON_WIDTH,
            height: this.BUTTON_HEIGHT,
            backgroundImage: "menuBalle",
            titleColor: "#FFFFFF",
            fontsize: 50,
            textPosition: { x: -130, y: -10 },
            hoverTint: 0xcccccc,
            onClick: () => {
                this.scene.start("lobbyScene");
            },
        });
    }
}

