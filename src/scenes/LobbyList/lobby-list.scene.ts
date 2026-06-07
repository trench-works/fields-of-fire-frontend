import { MenuSocket } from "./repositories/menu.socket";
import { LobbyScene } from "../Lobby/lobby.scene";
import {
    BaseScene,
    Button,
    CustomContainer,
    GridUtils,
    MenuButton,
} from "../../core";
import { FightScene } from "../Fight/fight.scene";
import { MainMenu } from "../MainMenu/main-menu.scene";
import { uiGrid } from "../../core/Utils/Grid";
import { LobbyRow } from "./objects/LobbyRow";
import { LobbyData } from "./interfaces/LobbyData";
import { LobbiesRepository } from "./repositories/lobbies.repository";
import { SceneAssetId } from "../../assets/ScenesAsset";
import { BackgroundAssetId } from "../../assets/BackgroundAsset";

export class LobbyListScene extends BaseScene {
    public menuSocket!: MenuSocket;
    private sceneGrid = GridUtils.uiGrid(0, 0);
    private lobbyData: LobbyData[] = [];
    private selectedLobby: LobbyData | null = null;
    private selectedRow: LobbyRow | null = null;
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
        const lobbyListArea = this.sceneGrid.getArea(0, 2, 9, 6);
        const lobbyGrid = uiGrid(
            0,
            0,
            lobbyListArea.width,
            lobbyListArea.height,
            9,
            12,
            lobbyListArea.x,
            lobbyListArea.y,
        );

        this.lobbyData.forEach((lobby, i) => {
            const rowArea = lobbyGrid.getArea(0, i, 9, 1);
            this.lobbyRows.push(
                new LobbyRow(this, rowArea, lobby, (row) => {
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
        const titleBox = this.sceneGrid.getArea(0, 0, 9, 2);
        this.add
            .text(this.scale.width / 2, titleBox.y + 20, "Liste des Lobby", {
                fontSize: "48px",
                color: "#ffffff",
            })
            .setOrigin(0.5, 0);

        //lobby list
        const lobbyListArea = this.sceneGrid.getArea(0, 2, 9, 6);
        new CustomContainer(this, {
            title: "",
            x: lobbyListArea.x + lobbyListArea.width / 2,
            y: lobbyListArea.y + lobbyListArea.height / 2,
            width: lobbyListArea.width,
            height: lobbyListArea.height,
            opacity: 0.25,
            borderWidth: 2,
        });
        //buttons

        const buttonArea = this.sceneGrid.getArea(0, 8, 9, 1);
        const buttonGrid = uiGrid(
            0,
            0,
            buttonArea.width,
            buttonArea.height,
            13,
            9,
            buttonArea.x,
            buttonArea.y,
        );

        buttonGrid.getArea(0, 0, 9, 9);

        const cell0 = buttonGrid.getArea(1, 1, 3, 7); // bouton gauche
        const cell1 = buttonGrid.getArea(5, 1, 3, 7); // bouton centre
        const cell2 = buttonGrid.getArea(9, 1, 3, 7); // bouton droit

        new Button(this, {
            text: "Créer un Lobby",
            x: cell0.centerX,
            y: cell0.centerY,
            width: cell0.width,
            height: cell0.height,
            onClick: () => {
                this.menuSocket.createLobby();
            },
        });

        new Button(this, {
            text: "Rejoindre un Lobby",
            x: cell2.centerX,
            y: cell2.centerY,
            width: cell2.width,
            height: cell2.height,
            onClick: () => {
                if (this.selectedLobby) {
                    this.menuSocket.joinLobby({
                        lobbyId: this.selectedLobby.id,
                    });
                }
            },
        });

        new Button(this, {
            text: "Actualiser",
            x: cell1.centerX,
            y: cell1.centerY,
            width: cell1.width,
            height: cell1.height,
            onClick: () => {
                this.resetLobbies();
            },
        });

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

