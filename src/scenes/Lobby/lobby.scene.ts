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
import { LobbyStore } from "./stores/LobbyStore";
import { LobbyData } from "../LobbyList/interfaces/LobbyData";

export type LobbySceneInit = {
    lobby : LobbyData;
};

export class LobbyScene extends BaseScene<LobbySceneInit> {
    private selectClassId: CharacterAssetId =
        CharacterAssetId.ENTENTE_FANTASSIN;
    private playerImageContainer!: DisplayContainer;
    private playerDescriptionText!: DisplayText;
    private playerClassName!: DisplayContainer;
    public lobbySocket!: LobbySocket;

    protected lobby!: LobbyData;
    protected playerId!: string;

    protected classStore: ClassStore;
    protected lobbyStore: LobbyStore;

    protected settingsRoot!: DisplayRoot;
    protected settingsArea!: GridArea;
    protected isPlayerTabActive: boolean = false;
    protected readyListContainers: DisplayContainer[] = [];
    protected startButton!: Button;

    constructor() {
        super(SceneAssetId.LOBBY, BackgroundAssetId.LOBBY);
        this.classStore = new ClassStore();
        this.lobbyStore = new LobbyStore();
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
            const { lobby } = init.data;
            this.lobby= lobby;
            const player =  lobby.players.find((player) => player.userId === globalThis.user?.id)!;
            this.playerId =player.playerId!;
            this.lobbyStore.setLobby(lobby);
            this.buildPlayerList();
            this.selectClassId = player.classId;
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
        this.lobbySocket = new LobbySocket(this.lobby.id);
        this.lobbySocket.onClose(() => MainMenu.start(this));
        this.lobbySocket.onLobbyUpdate((event) => {
            this.lobbyStore.setLobby(event.lobby);
            this.buildPlayerList();
            this.buildReadyList(); 
            this.updateStartButton();
            //TODO: rerender ton tab réglages -> actuellement ca mettra pas à jour
        });
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
        ).setText(this.lobby.name ?? "NO_NAME");

        //tab BOX
        const tabManager = new TabManager(
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
                    label: "Joueurs",
                    build: (root, area) => {
                        this.settingsRoot = root;  
                        this.settingsArea = area;
                        this.buildPlayerList();
                    },
                },
            ],
        );

        const originalSwitchTo = tabManager.switchTo.bind(tabManager);
        tabManager.switchTo = (index: number) => {
            originalSwitchTo(index);
            this.isPlayerTabActive = index === 2;
        };

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
                x: 1,
                y: 6.5,
                width: 9,
                height: 2.5,
                margin: { top: 5, bottom: 10, left: 10, right: 10 },
            }),
        );
        playerTextContainer.setDescription(
            this.classStore.getClass(this.selectClassId).classDescription,
            { color: Color.btnBorder },
        );
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

        const isCreator = this.lobby.creatorId === global.user?.id;
        const allReady = this.lobby.playerReady.length === this.lobby.players.length;
        const iAmReady = this.lobby.playerReady.includes(this.playerId);

        console.log("creator : ", this.lobby.creatorId, ", me :", global.user?.id);
        this.startButton = new Button(
            this,
            playerGrid.getArea({
                x: 1,
                y: 9,
                width: 4,
                height: 1,
            }),
            {
                text: isCreator && iAmReady ? "Combattre" : "Prêt",
                borderWidth: 2,
                borderColor: "#ffffff",
                onClick: () => {
                    if (isCreator && allReady) {
                        this.lobbySocket.startGame();
                    } else {
                        this.setPlayerReady(this.playerId);
                    }
                },
            },
        ).setIsActivated(isCreator ? (iAmReady ? allReady : true) : !iAmReady);

        this.buildReadyList();

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
                            this.changeClass(charClass.id);
                        },
                    },
                ),
            );
        });
    }

    buildPlayerList() {
        if (!this.settingsRoot || !this.settingsArea) return;

        this.settingsRoot.destroy();

        const players = this.lobbyStore.lobby?.players ?? [];
        const listGrid = this.settingsArea.getGrid({
            division: { horizontal: 1, vertical: 4 },
            padding: 5,
        });

        players.forEach((player, index) => {
            const rowGrid = listGrid.getSubGrid(
                { x: 1, y: index + 1, width: 1, height: 1 },
                { division: { horizontal: 5, vertical: 1 } },
            );

            this.settingsRoot.add(
                new DisplayContainer(this, rowGrid.getArea({ x: 1, y: 1 }), {
                    backgroundImage: CharacterCloseupAsset.getAssetKey(
                        player.classId as CharacterAssetId,
                    ),
                    borderWidth: 2,
                }),
            );

            this.settingsRoot.add(
                new DisplayText(this, rowGrid.getArea({ x: 2, y: 1, width: 4, height: 1 }))
                    .setText(player.name ?? player.userId),
            );
        });

        // 👈 applique la bonne visibilité selon l'onglet actif
        this.settingsRoot.setVisible(this.isPlayerTabActive);
    }

    updatePlayerData(classId: CharacterAssetId) {
        this.selectClassId = classId;

        // Met directement la nouvelle image
        this.playerImageContainer.setBackgroundImage(
            CharacterCloseupAsset.getAssetKey(classId),
        );

        // Met à jour le nom
        this.playerClassName.setText(this.classStore.getClass(classId).name);

        //Met à jour la desc
        this.playerDescriptionText.setDescription(
            this.classStore.getClass(this.selectClassId).classDescription,
            { color: Color.btnBorder },
        );
    }

    buildReadyList() {
        this.readyListContainers.forEach((c) => c.destroy());
        this.readyListContainers = [];

        const playerGrid = this.rootGrid.getSubGrid(
            { x: 7, y: 2, width: 3, height: 8 },
            { division: { horizontal: 9, vertical: 9 } },
        );

        const readyGrid = playerGrid.getSubGrid(
            { x: 5, y: 9, width: 5, height: 1 },
            { division: { horizontal: 4, vertical: 1 } },
        );

        const players = this.lobbyStore.lobby?.players ?? [];
        const playerReady = this.lobbyStore.lobby?.playerReady ?? []; // 👈

        for (let i = 0; i < 4; i++) {
            const player = players[i];
            const isReady = player ? playerReady.includes(player.playerId) : false;

            const container = new DisplayContainer(
                this,
                readyGrid.getArea({ x: i + 1, y: 1, width: 1, height: 1 }),
                {
                    backgroundImage: player
                        ? CharacterCloseupAsset.getAssetKey(player.classId as CharacterAssetId)
                        : undefined,
                    borderWidth: 2,
                    opacity: player ? 1 : 0.2,
                    outterRadius: 0,
                    innerRadius: 0,
                },
            );

            if (player && !isReady) {
                container.setTint(0x888888);
            }

            this.readyListContainers.push(container);
        }
    }

    updateStartButton() {
        const isCreator = this.lobby.creatorId === global.user?.id;
        const allReady = (this.lobbyStore.lobby?.playerReady.length ?? 0) === (this.lobbyStore.lobby?.players.length ?? 0);
        const iAmReady = this.lobbyStore.lobby?.playerReady.includes(this.playerId) ?? false;

        this.startButton.displayText(isCreator && iAmReady ? "Combattre" : "Prêt");
        this.startButton.setIsActivated(isCreator ? (iAmReady ? allReady : true) : !iAmReady);
        this.startButton.setOnClick(() => {
            if (isCreator && allReady) {
                this.lobbySocket.startGame();
            } else {
                this.setPlayerReady(this.playerId);
            }
        });
    }

    changeClass(classId : CharacterAssetId) {
         this.lobbySocket.changeClass({
            classId,
        });
        this.updatePlayerData(classId);
    }

    setPlayerReady(playerId : string) {
        this.lobbySocket.setPlayerReady({
            playerId
        });
    }
}

