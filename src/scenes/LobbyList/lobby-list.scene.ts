import { MenuSocket } from "./repositories/menu.socket";
import { LobbySceneInit } from "../Lobby/lobby.scene";
import {
    Button,
    CustomContainer,
    GridUtils,
    MenuButton,
    Position,
    TabManager,
} from "../../core";
import { Color } from "../../config/ColorConfig";

export class LobbyListScene extends Phaser.Scene {
    private backgroundImage = "red_bg";
    public menuSocket!: MenuSocket;
    private tabWidth!: number;
    private tabHeight!: number;
    private playerImageContainer!: CustomContainer;
    private playerClassName!: CustomContainer;
    private menuButton!: MenuButton;

    constructor() {
        super({ key: "lobbyListScene" });
    }

    preload() {
        this.load.image(
            this.backgroundImage,
            `assets/${this.backgroundImage}.png`,
        );
    }

    startLobbyScene(data: LobbySceneInit) {
        this.scene.start("lobbyScene", data);
    }

    create() {
        this.menuSocket = new MenuSocket();

        this.menuSocket.onJoin(({ lobbyId, playerId }) => {
            console.log(
                `Rejoint le lobby ${lobbyId} en tant que joueur ${playerId}`,
            );
            this.startLobbyScene({
                lobbyId,
                playerId,
            });
        });
        this.createDisplay();
    }

    createDisplay() {
        //title BOX
        const titleBox = GridUtils.uiGrid(0, 0);
        const bg = this.add
            .image(0, 0, this.backgroundImage)
            .setOrigin(0, 0)
            .setDepth(-1);
        bg.setDisplaySize(this.scale.width, this.scale.height);
        this.add
            .text(this.scale.width / 2, titleBox.y + 20, "Liste des Lobby", {
                fontSize: "48px",
                color: "#ffffff",
            })
            .setOrigin(0.5, 0);

        //tab BOX
        const tabArea = GridUtils.uiGrid(0, 1);
        const tabPanelWidth = tabArea.cellW * 3;
        const tabPanelHeight = this.scale.height - tabArea.cellH;
        const currenttabPosition = new Position(
            tabArea.x + tabPanelWidth / 2,
            tabArea.y + tabPanelHeight / 2,
        );
        //console.log("TabArea dimensions:", tabArea.cellH, tabArea.cellW, " window, " , window.innerWidth, window.innerHeight);

        this.tabWidth = tabArea.cellW * 2; // colonnes 0 et 1
        this.tabHeight = this.scale.height - tabArea.cellH; // lignes 1 à 8

        const tabManager = new TabManager(this, [
            {
                label: "Classes",
                build: (container) => {
                    //container.add(this.add.text(50, 0, "not implemented yet"));
                    // this.buildClassesTab(container);
                },
            },
            {
                label: "Maitrises",
                build: (container) => {
                    container.add(
                        this.add.text(50, 0, "not implemented yet", {
                            fontSize: "48px",
                            color: "#ffffff",
                        }),
                    );
                },
            },
            {
                label: "Equipements",
                build: (container) => {
                    container.add(
                        this.add.text(50, 0, "not implemented yet", {
                            fontSize: "48px",
                            color: "#ffffff",
                        }),
                    );
                },
            },
        ]);
        tabManager.setPosition(tabArea.x + this.tabWidth / 2, tabArea.y + 20);

        //Selected character info BOX
        const area = GridUtils.uiGrid(6, 1);
        const playerPanelWidth = area.cellW * 3;
        const playerPanelHeight = this.scale.height - area.cellH;
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
            borderWidth: 5,
        });

        const playerpanelgrid = GridUtils.uiGrid(
            0,
            0,
            playerPanelWidth,
            playerPanelHeight,
        );

        const imgArea = playerpanelgrid.getArea(0, 0, 5, 5);

        const classNameArea = playerpanelgrid.getArea(0, 5, 9, 0.5);

        const playerNameContainer = new CustomContainer(this, {
            title: "Select to a lobby...",
            x: classNameArea.centerX - playerPanelWidth / 2,
            y: classNameArea.centerY - playerPanelHeight / 2 + 10,
            width: classNameArea.width,
            height: classNameArea.height,
            bgColor: Color.containerBorder,
            borderWidth: 5,
        });

        playerPanel.add(playerNameContainer);
        this.playerClassName = playerNameContainer;

        const buttonArea = playerpanelgrid.getArea(0, 8, 4, 1);

        const fightButton = new Button(this, {
            x: buttonArea.centerX - playerPanelWidth / 2 + 10,
            y: buttonArea.centerY - playerPanelHeight / 2 - 10,
            width: buttonArea.width,
            height: buttonArea.height,
            text: "Créer un lobby",
            color: "#2A4237",
            colorOnOver: "#4a7aa8",
            borderWidth: 2,
            borderColor: "#ffffff",
            onClick: () => {
                this.menuSocket.createLobby();
            },
        });
        playerPanel.add(fightButton);

        // Créer le bouton Menu
        this.menuButton = new MenuButton(this, {
            position: "topRight",
            onResumeClick: () => {
                // Reprendre le jeu (le menu se ferme automatiquement)
            },
            onSettingsClick: () => {
                console.log("Options - À implémenter");
            },
            onMainMenuClick: () => {
                this.scene.start("mainMenuScene");
            },
        });
    }
}

