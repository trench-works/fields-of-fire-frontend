import { MenuSocket } from "./repositories/menu.socket";
import { LobbyScene } from "../Lobby/lobby.scene";
import {
    Button,
    CustomContainer,
    GridUtils,
    MenuButton,
    Position,
    TabManager,
} from "../../core";
import { Color } from "../../config/ColorConfig";
import { FightScene } from "../Fight/fight.scene";
import { MainMenu } from "../MainMenu/main-menu.scene";
import { uiGrid } from "../../core/Utils/Grid";
import { LobbyRow } from "./objects/LobbyRow";
import { LobbyData, LobbyStatus } from "./interfaces/LobbyData";

export class LobbyListScene extends Phaser.Scene {
    private backgroundImage = "red_bg";
    public menuSocket!: MenuSocket;
    private menuButton!: MenuButton;
    private sceneGrid = GridUtils.uiGrid(0, 0);
    private lobbyData : LobbyData[] = [];
    private selectedLobby: LobbyData | null = null;
    private selectedRow: LobbyRow | null = null;

    static start(scene: Phaser.Scene) {
        scene.scene.start("lobbyListScene");
    }

    constructor() {
        super({ key: "lobbyListScene" });
    }

    preload() {
        this.load.image(
            this.backgroundImage,
            `assets/${this.backgroundImage}.png`,
        );
    }

    create() {

        //to remove when the lobby list will be sent from the back
            this.lobbyData = [
                { lobbyId: "lobby1", lobbyName: "Lobby 1", players: 1, maxPlayers: 4, creator: "player1", status: LobbyStatus.IN_GAME },
                { lobbyId: "lobby2", lobbyName: "Lobby 2", players: 2, maxPlayers: 4, creator: "player2", status: LobbyStatus.OPEN },
                { lobbyId: "lobby3", lobbyName: "Lobby 3", players: 3, maxPlayers: 4, creator: "player3", status: LobbyStatus.OPEN },
            ];

        this.menuSocket = new MenuSocket();
        this.menuSocket.onClose(() => MainMenu.start(this));

        this.menuSocket.onJoin(({ lobbyId, playerId }) => {
            console.log(
                `Rejoint le lobby ${lobbyId} en tant que joueur ${playerId}`,
            );
            LobbyScene.start(this, {
                lobbyId,
                playerId,
            });
        });

        this.menuSocket.onReconnect(({ game, player }) => {
            console.log(
                `Rejoint la game ${game.id} en tant que joueur ${player.playerId}`,
            );

            FightScene.start(this, {
                game,
                player,
            });
        });
        this.createDisplay();
    }

    createDisplay() {
        //title BOX
        const titleBox = this.sceneGrid.getArea(0, 0, 9, 2);
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

        //lobby list
        const LobbyListArea = this.sceneGrid.getArea(0, 2, 9, 6);
        const lobbyListContainer = new CustomContainer(this, {
            title: "",
            x: LobbyListArea.x + LobbyListArea.width / 2,
            y: LobbyListArea.y + LobbyListArea.height / 2,
            width: LobbyListArea.width,
            height: LobbyListArea.height,
            opacity: 0.25,
            borderWidth: 2,
        });

        const lobbyGrid = uiGrid(
            0, 0,
            LobbyListArea.width,
            LobbyListArea.height,
            9, 12,   
            LobbyListArea.x,          
            LobbyListArea.y
        );
        
        this.lobbyData.forEach((lobby, i) => {
            const rowArea = lobbyGrid.getArea(0, i, 9, 1);
            const row = new LobbyRow(this, rowArea, lobby, () => {
                    this.selectedRow?.setSelected(false); // désélectionne l'ancienne
                    this.selectedLobby = lobby;
                    this.selectedRow = row;
                    row.setSelected(true);                // sélectionne la nouvelle
                });
        });
        //buttons

        const buttonArea = this.sceneGrid.getArea(0, 8, 9, 1);
        const buttonGrid = uiGrid(
            0, 0,
            buttonArea.width,
            buttonArea.height,
            13, 9,
            buttonArea.x,   
            buttonArea.y 
        );

        const createButtonArea = buttonGrid.getArea(0, 0, 9, 9);
        
        const cell0 = buttonGrid.getArea(1, 1, 3, 7); // bouton gauche
        const cell1 = buttonGrid.getArea(5, 1, 3, 7); // bouton centre  
        const cell2 = buttonGrid.getArea(9, 1, 3, 7); // bouton droit


        const createButton = new Button(this, {
            text: "Créer un Lobby",
            x: cell0.centerX,
            y: cell0.centerY,
            width: cell0.width,
            height: cell0.height,
            onClick: () => {
                console.log("Créer un lobby - À implémenter");
            }
        });

        const joinButton = new Button(this, {
            text: "Rejoindre un Lobby",
            x: cell2.centerX,
            y: cell2.centerY,
            width: cell2.width,
            height: cell2.height,
            onClick: () => {
                if (!this.selectedLobby) {
                    console.warn("Aucun lobby sélectionné");
                    return;
                }
            console.log(`Rejoindre le lobby : ${this.selectedLobby.lobbyId}`);
            }
        });

        const refreshButton = new Button(this, {
            text: "Actualiser",
            x: cell1.centerX,
            y: cell1.centerY,
            width: cell1.width,
            height: cell1.height,
            onClick: () => {
                console.log("Actualiser - À implémenter");
            }
        });

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

