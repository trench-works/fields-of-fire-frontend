import { Color } from "../../../config/ColorConfig";
import {
    BaseScene,
    Button,
    Depth,
    DisplayInput,
    DisplayText,
    Grid,
    UI_LEVELS_OFFSET,
} from "../../../core";
import { translate } from "../../../core/i18n/i18n";
import { GameMode } from "../../../Model/Game";
import { LobbySocket } from "../repositories/lobby.socket";
import { LobbyStore } from "../stores/lobby.store";

export class SettingsDisplayer extends Phaser.GameObjects.Container {
    private overlay!: Phaser.GameObjects.Rectangle;
    private panel!: Phaser.GameObjects.Rectangle;

    private gameModeTitle: DisplayText;
    private boardSizeTitle: DisplayText;
    private lobbyNameTitle: DisplayText;

    constructor(scene: BaseScene, lobbyStore: LobbyStore, socket: LobbySocket) {
        super(scene, 0, 0);
        const root = new Grid();
        scene.add.existing(this);
        this.setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP));

        // Créer un overlay semi-transparent qui capture TOUS les clics
        this.overlay = scene.add
            .rectangle(
                scene.scale.width / 2,
                scene.scale.height / 2,
                scene.scale.width * 2,
                scene.scale.height * 2,
                0x000000,
                0.7,
            )
            .setInteractive()
            .setScrollFactor(0)
            .setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 1);
        this.add(this.overlay);

        // Créer le panneau du menu
        const panelArea = root.getArea({ x: 4, y: 3, width: 3, height: 6 });
        this.panel = scene.add
            .rectangle(
                scene.scale.width / 2,
                scene.scale.height / 2 + 50,
                panelArea.width,
                panelArea.height,
                Phaser.Display.Color.HexStringToColor(Color.containerBg).color,
            )
            .setScrollFactor(0)
            .setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 2)
            .setStrokeStyle(3, 0xffffff);
        this.add(this.panel);
        const panelGrid = panelArea.getGrid({
            division: { horizontal: 7, vertical: 9 },
        });

        // close button
        this.add(
            new Button(
                scene,
                panelGrid.getArea({ x: 6, y: 1, width: 2, margin: 5 }),
                {
                    text: translate("lobby.settingsPopup.close"),
                    onClick: () => this.hide(),
                },
            ).setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 3),
        );

        //Game Mode Setting
        this.gameModeTitle = new DisplayText(
            scene,
            panelGrid.getArea({ x: 1, y: 3, width: 2, margin: 5 }),
        )
            .setText(translate("lobby.gameMode"))
            .setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 3);
        this.add(
            new Button(scene, panelGrid.getArea({ x: 3, y: 3, margin: 5 }), {
                text: "Infinity",
                onClick: () => (lobbyStore.gameMode = GameMode.INFINITY),
            }).setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 3),
        );
        this.add(
            new Button(scene, panelGrid.getArea({ x: 4, y: 3, margin: 5 }), {
                text: "PVP",
                onClick: () => (lobbyStore.gameMode = GameMode.PVP),
            }).setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 3),
        );

        //Board Size Setting
        this.boardSizeTitle = new DisplayText(
            scene,
            panelGrid.getArea({ x: 1, y: 4, width: 2, margin: 5 }),
        )
            .setText(translate("lobby.mapSize"))
            .setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 3);
        this.add(
            new Button(scene, panelGrid.getArea({ x: 3, y: 4, margin: 5 }), {
                text: "10",
                onClick: () => (lobbyStore.boardSize = 10),
            }).setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 3),
        );
        this.add(
            new Button(scene, panelGrid.getArea({ x: 4, y: 4, margin: 5 }), {
                text: "20",
                onClick: () => (lobbyStore.boardSize = 20),
            }).setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 3),
        );
        this.add(
            new Button(scene, panelGrid.getArea({ x: 5, y: 4, margin: 5 }), {
                text: "30",
                onClick: () => (lobbyStore.boardSize = 30),
            }).setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 3),
        );

        // Lobby Name Setting
        this.lobbyNameTitle = new DisplayText(
            scene,
            panelGrid.getArea({ x: 1, y: 5, width: 2, margin: 5 }),
        )
            .setText(translate("lobby.lobbyName"))
            .setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 3);
        this.add(
            new DisplayInput(scene, {
                area: panelGrid.getArea({ x: 3, y: 5, width: 3, margin: 5 }),
                depth: Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 3,
            }),
        );

        // Save
        this.add(
            new Button(
                scene,
                panelGrid.getArea({ x: 6, y: 9, width: 2, margin: 5 }),
                {
                    text: translate("lobby.settingsPopup.save"),
                    onClick: () => {
                        lobbyStore.applySettings();
                        socket.updateLobby(lobbyStore.lobby!);
                    },
                },
            ).setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 3),
        );

        this.hide();
    }

    show() {
        this.setVisible(true);
    }

    hide() {
        this.setVisible(false);
    }

    setVisible(visible: boolean): this {
        super.setVisible(visible);
        this.gameModeTitle.setVisible(visible);
        this.boardSizeTitle.setVisible(visible);
        this.lobbyNameTitle.setVisible(visible);
        this.overlay.setVisible(visible);
        this.panel.setVisible(visible);
        return this;
    }
}

