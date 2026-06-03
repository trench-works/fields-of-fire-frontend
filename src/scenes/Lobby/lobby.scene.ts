import {
    Button,
    CustomContainer,
    TabManager,
    GridUtils,
    Position,
    MenuButton,
    BaseScene,
} from "../../core";
import { Color } from "../../config/ColorConfig";
import { CharacterClass } from "../../Model/CharacterClass";
import { LobbySocket } from "./repositories/lobby.socket";
import { CharacterCloseupAsset, CharacterIconAsset } from "../../assets";
import { FightScene } from "../Fight/fight.scene";
import { ClassesRepository } from "./repositories/classes.repository";
import { MainMenu } from "../MainMenu/main-menu.scene";
import { SceneAssetId } from "../../assets/ScenesAsset";
import { BackgroundAssetId } from "../../assets/BackgroundAsset";

export type LobbySceneInit = {
    lobbyId: string;
    playerId: string;
};

export class LobbyScene extends BaseScene {
    private classes: CharacterClass[] = [];
    private selectClassId: string = "entente_fantassin";
    private tabWidth!: number;
    private tabHeight!: number;
    private playerImageContainer!: CustomContainer;
    private playerClassName!: CustomContainer;
    public lobbySocket!: LobbySocket;

    protected lobbyId!: string;
    protected playerId!: string;

    constructor() {
        super(SceneAssetId.LOBBY, BackgroundAssetId.LOBBY);
        new ClassesRepository().getClasses().then((data) => {
            this.classes = data;
        });
    }

    static start(scene: Phaser.Scene, data: LobbySceneInit) {
        scene.scene.start(SceneAssetId.LOBBY, data);
    }

    init({ lobbyId, playerId }: LobbySceneInit) {
        this.lobbyId = lobbyId;
        this.playerId = playerId;
    }

    preload() {
        super.preload();
        CharacterIconAsset.loadAll(this.load);
        CharacterCloseupAsset.loadAll(this.load);
    }

    create() {
        super.create();
        this.lobbySocket = new LobbySocket(this.lobbyId);
        this.lobbySocket.onClose(() => MainMenu.start(this));

        this.lobbySocket.onLobbyUpdate(console.log); //TODO: handle lobby infos update + display

        this.lobbySocket.onStart((game) => {
            const player = game.players.find(
                (player) => player.userId === global.user?.id,
            )!;
            console.log(
                `Rejoint la partie ${game.id} en tant que joueur ${player.playerId}`,
            );
            FightScene.start(this, {
                game,
                player,
            });
        });

        //title BOX
        const titleBox = GridUtils.uiGrid(0, 0);

        this.add
            .text(this.scale.width / 2, titleBox.y + 20, "LOBBY", {
                fontSize: "48px",
                color: "#ffffff",
            })
            .setOrigin(0.5, 0);

        //tab BOX
        const tabArea = GridUtils.uiGrid(0, 1);
        //console.log("TabArea dimensions:", tabArea.cellH, tabArea.cellW, " window, " , window.innerWidth, window.innerHeight);

        this.tabWidth = tabArea.cellW * 2; // colonnes 0 et 1
        this.tabHeight = this.scale.height - tabArea.cellH; // lignes 1 à 8

        const tabManager = new TabManager(this, [
            {
                label: "Classes",
                build: (container) => {
                    //container.add(this.add.text(50, 0, "not implemented yet"));
                    this.buildClassesTab(container);
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

        this.events.on("class-selected", (charClass: CharacterClass) => {
            this.selectClassId = charClass.id;

            // Rafraîchir l'image du playerPanel
            this.updatePlayerImage();
        });

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
            title:
                this.classes.find(({ id }) => id === this.selectClassId)
                    ?.name ?? "",
            x: classNameArea.centerX - playerPanelWidth / 2,
            y: classNameArea.centerY - playerPanelHeight / 2 + 10,
            width: classNameArea.width,
            height: classNameArea.height,
            bgColor: Color.containerBorder,
            borderWidth: 5,
        });

        playerPanel.add(playerNameContainer);
        this.playerClassName = playerNameContainer;

        const playerImageContainer = new CustomContainer(this, {
            title: "",
            x: imgArea.centerX - playerPanelWidth / 2 + 10,
            y: imgArea.centerY - playerPanelHeight / 2 + 10,
            width: imgArea.width,
            height: imgArea.height,
            backgroundImage: CharacterCloseupAsset.getAssetKey(
                this.selectClassId,
            ),
            borderWidth: 5,
        });
        playerPanel.add(playerImageContainer);

        this.playerImageContainer = playerImageContainer;

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
            onClick: () => {
                if (this.selectClassId) {
                    console.log("will start game");
                    this.lobbySocket.startGame();
                }
            },
        });
        playerPanel.add(fightButton);

        // Créer le bouton Menu
        new MenuButton(this, {
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

    //  --- ATTENTION !!!
    // cette fonction c'est du bricolage et nécessite un rework futur
    // ne jamais lui donner + de 3 classes sinon EXPLOSION

    private buildClassesTab(container: Phaser.GameObjects.Container) {
        const classes = this.classes.filter((charClass) => charClass.playable);
        const classesPerRow = 3;
        const contentwidth: number = container.width;
        const grid = GridUtils.uiGrid(
            0,
            0,
            contentwidth,
            this.tabHeight,
            9,
            Math.ceil(classes.length / classesPerRow),
        );

        classes.forEach((charClass, index) => {
            const col = (index % classesPerRow) * 3;
            const row = Math.floor(index / classesPerRow);

            const area = grid.getArea(col, row, 1, 1);

            const x = area.centerX - this.tabWidth / 2 + grid.cellW * 2.5;
            const y = area.centerY - this.tabHeight / 2 + grid.cellH * 0.25;

            const classContainer = new CustomContainer(this, {
                title: "",
                x: x,
                y: y + 10,
                width: grid.cellW * 2,
                height: area.height / 2,
                backgroundImage: CharacterIconAsset.getAssetKey(charClass.id),
                borderWidth: 7,
                onClick: () => {
                    this.events.emit("class-selected", charClass);
                },
            });
            container.add(classContainer);
        });
    }

    updatePlayerImage() {
        if (!this.selectClassId) return;

        this.lobbySocket.changeClass({
            classId: this.selectClassId,
        });

        // Met directement la nouvelle image
        this.playerImageContainer.setBackgroundImage(
            CharacterCloseupAsset.getAssetKey(this.selectClassId) ?? "",
        );

        // Met à jour le nom
        this.playerClassName.setTitle(
            this.classes.find(({ id }) => id === this.selectClassId)?.name ??
                "",
        );
    }
}

