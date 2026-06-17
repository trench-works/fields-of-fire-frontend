import {
    Button,
    DisplayContainer,
    TabManager,
    MenuButton,
    BaseScene,
    GridArea,
    DisplayRoot,
    DisplayText,
    ScaleMode,
    BaseSceneInit,
} from "../../core";
import { Color } from "../../config/ColorConfig";
import { LobbySocket } from "./repositories/lobby.socket";
import {
    CharacterAssetId,
    CharacterCloseupAsset,
    CharacterIconAsset,
    MusicAsset,
    MusicAssetId,
} from "../../assets";
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

export class LobbyScene extends BaseScene<LobbySceneInit> {
    private selectClassId: CharacterAssetId =
        CharacterAssetId.ENTENTE_FANTASSIN;
    private playerImageContainer!: DisplayContainer;
    private playerDescriptionText!: DisplayText;
    private playerClassName!: DisplayContainer;
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

    static start(scene: BaseScene, data: BaseSceneInit<LobbySceneInit>) {
        super.startScene(scene, SceneAssetId.LOBBY, data);
    }

    init(init: BaseSceneInit<LobbySceneInit>) {
        super.init(init);
        if (init?.data) {
            const { lobbyId, playerId } = init.data;
            this.lobbyId = lobbyId;
            this.playerId = playerId;
        }
    }

    preload() {
        super.preload();
        CharacterIconAsset.loadAll(this.load);
        CharacterCloseupAsset.loadAll(this.load);
        MusicAsset.load(this.load, MusicAssetId.MENU);
    }

    create() {
        super.create();
        this.playBackgroundMusic(MusicAssetId.MENU);
        this.lobbySocket = new LobbySocket(this.lobbyId);
        this.lobbySocket.onClose(() => MainMenu.start(this));

        this.lobbySocket.onLobbyUpdate(console.log); //TODO: handle lobby infos update + display

        this.lobbySocket.onStart((game) => {
            const player = game.players.find(
                (player) => player.userId === global.user?.id,
            )!;
            FightScene.start(this, {
                data: {
                    game,
                    player,
                },
                config: { keepMusic: false },
            });
        });

        //title BOX
        new DisplayText(
            this,
            this.rootGrid.getArea({
                x: 1,
                y: 1,
                width: 9,
                height: 1,
            }),
        ).setText("Lobby");

        //tab BOX
        new TabManager(
            this,
            this.rootGrid.getSubGrid(
                {
                    x: 1,
                    y: 2,
                    width: 6,
                    height: 8,
                },
                {
                    division: {
                        horizontal: 3,
                        vertical: 12,
                    },
                },
            ),
            [
                {
                    label: "Classes",
                    build: (root, area) => {
                        //container.add(this.add.text(50, 0, "not implemented yet"));
                        this.buildClassesTab(root, area);
                    },
                },
                {
                    label: "Maitrises",
                    build: (root, area) => {
                        root.add(
                            new DisplayText(this, area).setText(
                                "not implemented yet",
                            ),
                        );
                    },
                },
                {
                    label: "Réglages",
                    build: (root, area) => {
                        root.add(
                            new DisplayText(this, area).setText(
                                "not implemented yet",
                            ),
                        );
                    },
                },
            ],
        );
        //Selected character info BOX
        const playerGrid = this.rootGrid.getSubGrid(
            {
                x: 7,
                y: 2,
                width: 3,
                height: 8,
            },
            { division: { horizontal: 9, vertical: 9 } },
        );

        new DisplayContainer(this, playerGrid, {
            borderWidth: 5,
            outterRadius: 0,
        });

        const playerNameContainer = new DisplayContainer(
            this,
            playerGrid.getArea({
                x: 1,
                y: 6,
                width: 9,
                height: 0.5,
            }),
            {
                title: this.classStore.getClass(this.selectClassId).name,
                bgColor: Color.containerBorder,
                borderWidth: 5,
                outterRadius: 0,
            },
        );
        this.playerClassName = playerNameContainer;

        const playerTextContainer = new DisplayText(
            this,
            playerGrid.getArea({
                //voir si il y a un meilleur moyen de faire un padding ici
                x: 1.05,
                y: 6.55,
                width: 9,
                height: 3,
            }),
        );
        playerTextContainer.setDescription(this.classStore.getClass(this.selectClassId).classDescription, {color: Color.btnBorder, fontSize: 18})
        this.playerDescriptionText = playerTextContainer;

        const playerImageArea = playerGrid
            .getArea({
                x: 1,
                y: 1,
                width: 9,
                height: 5,
            })
            .scaleFromCenter(
                CharacterIconAsset.getAssetScale(this.selectClassId),
                ScaleMode.FIT,
            );

        const playerImageContainer = new DisplayContainer(
            this,
            {
                ...playerImageArea,
                x: playerGrid.x,
            },
            {
                backgroundImage: CharacterCloseupAsset.getAssetKey(
                    this.selectClassId,
                ),
                borderWidth: 5,
                outterRadius: 0,
            },
        );

        this.playerImageContainer = playerImageContainer;

        new Button(
            this,
            playerGrid.getArea({
                x: 1,
                y: 9,
                width: 4,
                height: 1,
            }),
            {
                text: "Combattre",
                borderWidth: 2,
                borderColor: "#ffffff",
                onClick: () => {
                    if (this.selectClassId) {
                        this.lobbySocket.startGame();
                    }
                },
            },
        );

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
                MainMenu.start(this);
            },
        });
    }

    private buildClassesTab(root: DisplayRoot, area: GridArea) {
        const classes = this.classStore.classes.filter(
            (charClass) => charClass.playable,
        );
        const classesPerRow = 3;
        const rows = 2;
        const grid = area.getGrid({
            division: { horizontal: classesPerRow, vertical: rows },
            padding: 20,
        });

        classes.slice(0, classesPerRow * rows).forEach((charClass, index) => {
            const col = (index % classesPerRow) + 1;
            const row = Math.floor(index / classesPerRow) + 1;

            root.add(
                new DisplayContainer(
                    this,
                    grid
                        .getArea({ x: col, y: row, width: 1, height: 1 })
                        .scaleFromCenter(
                            CharacterIconAsset.getAssetScale(charClass.id),
                            ScaleMode.FIT,
                        ),
                    {
                        title: charClass.name,
                        backgroundImage: CharacterIconAsset.getAssetKey(
                            charClass.id,
                        ),
                        borderWidth: 7,
                        onClick: () => {
                            this.updatePlayerData(charClass.id);
                        },
                    },
                ),
            );
        });
    }

    updatePlayerData(classId: CharacterAssetId) {
        this.selectClassId = classId;

        this.lobbySocket.changeClass({
            classId,
        });

        // Met directement la nouvelle image
        this.playerImageContainer.setBackgroundImage(
            CharacterCloseupAsset.getAssetKey(classId),
        );

        // Met à jour le nom
        this.playerClassName.setText(this.classStore.getClass(classId).name);

        //Met à jour la desc
        this.playerDescriptionText.setDescription(this.classStore.getClass(this.selectClassId).classDescription, {color: Color.btnBorder, fontSize: 18});
    }
}

