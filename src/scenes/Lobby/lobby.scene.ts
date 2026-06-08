import {
    Button,
    CustomContainer,
    TabManager,
    MenuButton,
    BaseScene,
    Grid,
} from "../../core";
import { Color } from "../../config/ColorConfig";
import { LobbySocket } from "./repositories/lobby.socket";
import { CharacterCloseupAsset, CharacterIconAsset } from "../../assets";
import { FightScene } from "../Fight/fight.scene";
import { ClassesRepository } from "./repositories/classes.repository";
import { MainMenu } from "../MainMenu/main-menu.scene";
import { SceneAssetId } from "../../assets/ScenesAsset";
import { BackgroundAssetId } from "../../assets/BackgroundAsset";
import { ClassStore } from "../Fight/stores/ClassStore";

export type LobbySceneInit = {
    lobbyId: string;
    playerId: string;
};

export class LobbyScene extends BaseScene {
    private selectClassId: string = "entente_fantassin";
    private tabWidth!: number;
    private tabHeight!: number;
    private playerImageContainer!: CustomContainer;
    private playerClassName!: CustomContainer;
    public lobbySocket!: LobbySocket;

    protected lobbyId!: string;
    protected playerId!: string;

    protected classStore: ClassStore;

    constructor() {
        super(SceneAssetId.LOBBY, BackgroundAssetId.LOBBY);
        this.classStore = new ClassStore();
        new ClassesRepository().getClasses().then((data) => {
            this.classStore.setClasses(data);
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
            FightScene.start(this, {
                game,
                player,
            });
        });

        //title BOX
        const titleBox = new Grid();

        this.add
            .text(this.scale.width / 2, titleBox.y + 20, "LOBBY", {
                fontSize: "48px",
                color: "#ffffff",
            })
            .setOrigin(0.5, 0);

        //tab BOX
        const tabArea = this.rootGrid.getSubGrid({ x: 1, y: 2 });

        this.tabWidth = tabArea.cell.width * 2; // colonnes 0 et 1
        this.tabHeight = this.scale.height - tabArea.cell.height; // lignes 1 à 8

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
                label: "Réglages",
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
        const area = this.rootGrid.getSubGrid({ x: 7, y: 2 });
        const playerPanelWidth = area.cell.width * 3;
        const playerPanelHeight = this.scale.height - area.cell.height;
        const currentPlayerInfoPosition = {
            x: area.x + playerPanelWidth / 2,
            y: area.y + playerPanelHeight / 2,
        };
        const playerPanel = new CustomContainer(this, {
            x: currentPlayerInfoPosition.x,
            y: currentPlayerInfoPosition.y,
            width: playerPanelWidth,
            height: playerPanelHeight,
            borderWidth: 5,
        });

        const playerpanelgrid = this.rootGrid.getSubGrid(
            {
                x: 1,
                y: 1,
            },
            {},
        );

        const imgArea = playerpanelgrid.getArea({
            x: 1,
            y: 1,
            width: 5,
            height: 5,
        });

        const classNameArea = playerpanelgrid.getArea({
            x: 1,
            y: 6,
            width: 9,
            height: 0.5,
        });

        const playerNameContainer = new CustomContainer(this, {
            title: this.classStore.getClass(this.selectClassId).name,
            x: classNameArea.center.x - playerPanelWidth / 2,
            y: classNameArea.center.y - playerPanelHeight / 2 + 10,
            width: classNameArea.width,
            height: classNameArea.height,
            bgColor: Color.containerBorder,
            borderWidth: 5,
        });

        playerPanel.add(playerNameContainer);
        this.playerClassName = playerNameContainer;

        const playerImageContainer = new CustomContainer(this, {
            x: imgArea.center.x - playerPanelWidth / 2 + 10,
            y: imgArea.center.y - playerPanelHeight / 2 + 10,
            width: imgArea.width,
            height: imgArea.height,
            backgroundImage: CharacterCloseupAsset.getAssetKey(
                this.selectClassId,
            ),
            borderWidth: 5,
        });
        playerPanel.add(playerImageContainer);

        this.playerImageContainer = playerImageContainer;

        const buttonArea = playerpanelgrid.getArea({
            x: 1,
            y: 9,
            width: 4,
            height: 1,
        });

        const fightButton = new Button(this, {
            x: buttonArea.center.x - playerPanelWidth / 2 + 10,
            y: buttonArea.center.y - playerPanelHeight / 2 - 10,
            width: buttonArea.width,
            height: buttonArea.height,
            text: "Combattre",
            borderWidth: 2,
            borderColor: "#ffffff",
            onClick: () => {
                if (this.selectClassId) {
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

    private buildClassesTab(container: Phaser.GameObjects.Container) {
        const classes = this.classStore.classes.filter(
            (charClass) => charClass.playable,
        );
        const classesPerRow = 3;
        const rows = 2;
        const padding = 100;

        const grid = new Grid({
            size: {
                width: container.width,
                height: this.tabHeight,
            },
            division: {
                horizontal: classesPerRow,
                vertical: rows,
            },
        });

        classes.slice(0, classesPerRow * rows).forEach((charClass, index) => {
            const col = index % classesPerRow;
            const row = Math.floor(index / classesPerRow);

            const area = grid.getArea({ x: col, y: row, width: 1, height: 1 });

            const classContainer = new CustomContainer(this, {
                title: charClass.name,
                x: area.center.x,
                y: area.center.y,
                width: area.width - padding,
                height: area.height - padding,
                backgroundImage: CharacterIconAsset.getAssetKey(charClass.id),
                borderWidth: 7,
                onClick: () => {
                    this.updatePlayerImage(charClass.id);
                },
            });
            container.add(classContainer);
        });
    }

    updatePlayerImage(classId: string) {
        this.selectClassId = classId;
        this.lobbySocket.changeClass({
            classId,
        });

        // Met directement la nouvelle image
        this.playerImageContainer.setBackgroundImage(
            CharacterCloseupAsset.getAssetKey(classId),
        );

        // Met à jour le nom
        this.playerClassName.setTitle(this.classStore.getClass(classId).name);
    }
}

