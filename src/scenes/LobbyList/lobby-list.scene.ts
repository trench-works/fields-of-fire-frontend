import { MenuSocket } from "./repositories/menu.socket";
import { LobbyScene } from "../Lobby/lobby.scene";
import {
    BaseScene,
    Button,
    CustomContainer,
    MenuButton,
    DisplayText,
} from "../../core";
import { FightScene } from "../Fight/fight.scene";
import { MainMenu } from "../MainMenu/main-menu.scene";
import { LobbyRow } from "./objects/LobbyRow";
import { SceneAssetId } from "../../assets/ScenesAsset";
import { BackgroundAssetId } from "../../assets/BackgroundAsset";
import { LobbyStore } from "./stores/LobbyStore";
import { MusicAsset, MusicAssetId } from "../../assets";

export class LobbyListScene extends BaseScene {
    public menuSocket!: MenuSocket;

    private joinButton!: Button;
    private lobbyRows: LobbyRow[] = [];

    protected lobbyStore: LobbyStore;

    static start(scene: BaseScene) {
        scene.stopBackgroundMusic();
        scene.scene.start(SceneAssetId.LOBBY_LIST);
    }

    constructor() {
        super(SceneAssetId.LOBBY_LIST, BackgroundAssetId.LOBBY);

        this.lobbyStore = new LobbyStore();
    }

    preload() {
        super.preload();
        MusicAsset.load(this.load, MusicAssetId.MENU);
    }

    init() {
        this.lobbyStore.setSelectedLobbyId(null);
        this.menuSocket = new MenuSocket();
        this.menuSocket.onClose(() => MainMenu.start(this));

        this.menuSocket.onJoin(({ lobbyId, playerId }) => {
            LobbyScene.start(this, {
                lobbyId,
                playerId,
            });
        });

        this.menuSocket.onUpdate(({ lobbies }) => {
            this.lobbyStore.setLobbies(lobbies);

            if (
                this.lobbyStore.selectedLobbyId &&
                !lobbies.some(
                    (lobby) => lobby.id === this.lobbyStore.selectedLobbyId,
                )
            ) {
                // reset selected lobby id if its not in the list anymore
                this.lobbyStore.setSelectedLobbyId(null);
                this.joinButton.setIsActivated(false);
            }
            this.displayLobbyList();
        });

        this.menuSocket.onReconnect(({ game, player }) => {
            FightScene.start(this, {
                game,
                player,
            });
        });
    }

    create() {
        super.create();
        this.playBackgroundMusic(MusicAssetId.MENU);
        this.createDisplay();
    }

    displayLobbyList() {
        this.lobbyRows.forEach((row) => row.destroy()); // destroy all rows
        const listGrid = this.rootGrid.getSubGrid(
            {
                x: 1,
                y: 3,
                width: 9,
                height: 6,
            },
            {
                division: {
                    vertical: 12,
                    horizontal: 9,
                },
            },
        );

        this.lobbyStore.lobbies.forEach((lobby, i) => {
            const rowArea = listGrid.getArea({
                x: 1,
                y: i + 1,
                width: 9,
                height: 1,
            });
            this.lobbyRows.push(
                new LobbyRow(
                    this,
                    rowArea,
                    {
                        id: lobby.id,
                        name: lobby.name ?? "NO_NAME",
                        creator: lobby.creator ?? "NO_NAME",
                        playersNum: lobby.players.length,
                        maxPlayers: lobby.maxPlayers,
                    },
                    () => {
                        this.joinButton.setIsActivated(true);
                        this.lobbyStore.setSelectedLobbyId(lobby.id);
                        this.lobbyRows.forEach((lobbyRow) => {
                            lobbyRow.setSelected(
                                lobbyRow.id === this.lobbyStore.selectedLobbyId,
                            );
                        });
                    },
                    lobby.id === this.lobbyStore.selectedLobbyId,
                ),
            );
        });
    }

    createDisplay() {
        //title BOX
        const titleBox = this.rootGrid.getArea({
            x: 1,
            y: 2,
            width: 9,
            height: 1,
        });
        new DisplayText(this, titleBox).setText("Liste des Lobby");

        //lobby list
        const lobbyListArea = this.rootGrid.getArea({
            x: 1,
            y: 3,
            width: 9,
            height: 6,
        });
        new CustomContainer(this, lobbyListArea, {
            opacity: 0.25,
            borderWidth: 2,
        });
        //buttons

        const buttonGrid = this.rootGrid.getSubGrid(
            {
                x: 1,
                y: 9,
                width: 9,
                height: 1,
            },
            {
                division: {
                    vertical: 9,
                    horizontal: 13,
                },
            },
        );

        new Button(
            this,
            buttonGrid.getArea({ x: 2, y: 2, width: 5, height: 7 }),
            {
                text: "Créer un Lobby",
                onClick: () => {
                    this.menuSocket.createLobby();
                },
            },
        );

        this.joinButton = new Button(
            this,
            buttonGrid.getArea({ x: 8, y: 2, width: 5, height: 7 }),
            {
                text: "Rejoindre un Lobby",
                onClick: () => {
                    if (this.lobbyStore.selectedLobbyId) {
                        this.menuSocket.joinLobby({
                            lobbyId: this.lobbyStore.selectedLobbyId,
                        });
                    }
                },
            },
        ).setIsActivated(false);

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
}

