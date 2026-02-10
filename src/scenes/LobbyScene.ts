import { Button } from "../core/UI/Button";
import { CustomContainer } from "../core/UI/Container";
import { TabManager } from "../core/UI/TabManager";
import { uiGrid } from "../core/Utils";
import { Position } from "../Model/Position";

export class LobbyScene extends Phaser.Scene {
    private backgroundImage = "red_bg";
    private temporaryClassKeyList = [
        "entente_fantassin_spritesheet",
        "entente_medic_spritesheet",
        "entente_caporal",
    ];
    private currentSelectedClassKey: string | null = "entente_caporal";

    constructor() {
        super({ key: "lobbyScene" });
    }

    preload() {
        this.load.image(
            this.backgroundImage,
            `assets/${this.backgroundImage}.jpg`,
        );
        this.temporaryClassKeyList.forEach((key) => {
            this.load.image(key, `assets/${key}.png`);
        });
    }

    create() {
        //title BOX
        const bg = this.add
            .image(0, 0, this.backgroundImage)
            .setOrigin(0, 0)
            .setDepth(-1);
        bg.setDisplaySize(this.scale.width, this.scale.height);
        const titleBox = uiGrid(0, 0);
        this.add
            .text(this.scale.width / 2, titleBox.y + 20, "LOBBY", {
                fontSize: "48px",
                color: "#ffffff",
            })
            .setOrigin(0.5, 0);

        //tabBox
        const tabArea = uiGrid(0, 1);
        const tabWidth = tabArea.cellW * 2; // colonnes 0 et 1
        //const tabHeight = tabArea.cellH * 8; // lignes 1 à 8

        const tabManager = new TabManager(this, [
            {
                label: "Classes",
                build: (container) => {
                    container.add(this.add.text(50, 0, "ClassList"));
                },
            },
            {
                label: "Maitrises",
                build: (container) => {
                    container.add(this.add.text(50, 0, "not implemented yet"));
                },
            },
            {
                label: "Equipements",
                build: (container) => {
                    container.add(this.add.text(50, 0, "not implemented yet"));
                },
            },
        ]);
        tabManager.setPosition(tabArea.x + tabWidth / 2, tabArea.y + 20);

        //Selected character info BOX
        const area = uiGrid(6, 1); // Largeur = 3 colonnes
        const playerPanelWidth = area.cellW * 3; // Hauteur = toute la hauteur - la hauteur de la première ligne
        const playerPanelHeight = this.scale.height - area.cellH; // Position X = centre des 3 colonnes
        const currentPlayerInfoPosition = new Position(
            area.x + playerPanelWidth / 2,
            area.y + playerPanelHeight / 2,
        );
        const playerPanel = new CustomContainer(this, {
            title: "",
            x: currentPlayerInfoPosition.x,
            y: currentPlayerInfoPosition.y,
            width: playerPanelWidth,
            height: playerPanelHeight,
            bgColor: 0xd4d2b8,
            borderColor: 0x2a4237,
        });

        const playerpanelgrid = uiGrid(
            0,
            0,
            playerPanelWidth,
            playerPanelHeight,
        );

        const imgArea = playerpanelgrid.getArea(0, 0, 5, 5);

        const playerSprite = this.add
            .image(
                imgArea.centerX - playerPanelWidth / 2 + 10,
                imgArea.centerY - playerPanelHeight / 2 + 10,
                this.currentSelectedClassKey!,
            )
            .setDisplaySize(imgArea.width, imgArea.height);

        const border = this.add.graphics();
        border.lineStyle(10, 0x2a4237, 1);
        border.strokeRect(
            playerSprite.x - playerSprite.displayWidth / 2,
            playerSprite.y - playerSprite.displayHeight / 2,
            playerSprite.displayWidth,
            playerSprite.displayHeight,
        );

        playerPanel.add(border);
        playerPanel.add(playerSprite);

        const buttonArea = playerpanelgrid.getArea(0, 8, 4, 1);

        const fightButton = new Button(this, {
            x: buttonArea.centerX - playerPanelWidth / 2 + 10,
            y: buttonArea.centerY - playerPanelHeight / 2 - 10,
            width: buttonArea.width,
            height: buttonArea.height,
            text: "Combattre",
            color: "#2A4237",
            colorOnOver: "#4a7aa8",
            borderWidth: 2,
            borderColor: "#ffffff",
            onClick: () => this.scene.start("fightScene"),
        });
        playerPanel.add(fightButton);
    }
}
