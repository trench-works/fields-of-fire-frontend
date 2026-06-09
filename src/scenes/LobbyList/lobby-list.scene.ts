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
import { LobbyData } from "./interfaces/LobbyData";
import { LobbiesRepository } from "./repositories/lobbies.repository";
import { SceneAssetId } from "../../assets/ScenesAsset";
import { BackgroundAssetId } from "../../assets/BackgroundAsset";

export class LobbyListScene extends BaseScene {
    public menuSocket!: MenuSocket;

    private lobbyData: LobbyData[] = [];
    private selectedLobby: LobbyData | null = null;

    private selectedRow: LobbyRow | null = null;
    private refreshButton!: Button;
    private lobbyRows: LobbyRow[] = [];

    private lobbyResetTimeout: NodeJS.Timeout | undefined;

    static start(scene: Phaser.Scene) {
        scene.scene.start(SceneAssetId.LOBBY_LIST);
    }

    constructor() {
        super(SceneAssetId.LOBBY_LIST, BackgroundAssetId.LOBBY);
    }

    preload() {
        super.preload();
    }

    init() {
        this.resetLobbies();
    }

    resetLobbies() {
        if (this.lobbyResetTimeout) {
            clearTimeout(this.lobbyResetTimeout);
        }
        this.lobbyResetTimeout = setTimeout(
            this.resetLobbies.bind(this),
            10 * 1000,
        );
        new LobbiesRepository().getLobbies().then((lobbies) => {
            this.lobbyData = lobbies;
            this.displayLobbyList();
        });
    }

    create() {
        super.create();
        this.menuSocket = new MenuSocket();
        this.menuSocket.onClose(() => MainMenu.start(this));

        this.menuSocket.onJoin(({ lobbyId, playerId }) => {
            if (this.lobbyResetTimeout) {
                clearTimeout(this.lobbyResetTimeout);
            }
            LobbyScene.start(this, {
                lobbyId,
                playerId,
            });
        });

        this.menuSocket.onReconnect(({ game, player }) => {
            if (this.lobbyResetTimeout) {
                clearTimeout(this.lobbyResetTimeout);
            }
            FightScene.start(this, {
                game,
                player,
            });
        });
        this.createDisplay();
    }

    displayLobbyList() {
        this.selectedLobby = null;
        this.selectedRow = null;
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

        this.lobbyData.forEach((lobby, i) => {
            const rowArea = listGrid.getArea({
                x: 1,
                y: i + 1,
                width: 9,
                height: 1,
            });
            this.lobbyRows.push(
                new LobbyRow(this, rowArea, lobby, (row) => {
                    this.refreshButton.setIsActivated(true);
                    this.selectedRow?.setSelected(false); // désélectionne l'ancienne
                    this.selectedLobby = lobby;
                    this.selectedRow = row;
                    row.setSelected(true); // sélectionne la nouvelle
                }),
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
        new CustomContainer(this, {
            x: lobbyListArea.center.x,
            y: lobbyListArea.center.y,
            width: lobbyListArea.width,
            height: lobbyListArea.height,
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

        buttonGrid.getArea({ x: 0, y: 0, width: 9, height: 9 });

        const cell0 = buttonGrid.getArea({ x: 2, y: 1, width: 3, height: 7 }); // bouton gauche
        const cell1 = buttonGrid.getArea({ x: 6, y: 1, width: 3, height: 7 }); // bouton centre
        const cell2 = buttonGrid.getArea({ x: 10, y: 1, width: 3, height: 7 }); // bouton droit

        new Button(this, {
            text: "Créer un Lobby",
            x: cell0.center.x,
            y: cell0.center.y,
            width: cell0.width,
            height: cell0.height,
            onClick: () => {
                this.menuSocket.createLobby();
            },
        });

        new Button(this, {
            text: "Actualiser",
            x: cell1.center.x,
            y: cell1.center.y,
            width: cell1.width,
            height: cell1.height,
            onClick: () => {
                this.resetLobbies();
            },
        });

        this.refreshButton = new Button(this, {
            text: "Rejoindre un Lobby",
            x: cell2.center.x,
            y: cell2.center.y,
            width: cell2.width,
            height: cell2.height,
            onClick: () => {
                if (this.selectedLobby) {
                    this.menuSocket.joinLobby({
                        lobbyId: this.selectedLobby.id,
                    });
                }
            },
        }).setIsActivated(false);

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
                if (this.lobbyResetTimeout) {
                    clearTimeout(this.lobbyResetTimeout);
                }
                MainMenu.start(this);
            },
        });
    }
}

