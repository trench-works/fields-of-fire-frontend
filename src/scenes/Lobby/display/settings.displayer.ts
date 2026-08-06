import { Color } from "../../../config/ColorConfig";
import {
    BaseScene,
    Button,
    Depth,
    DisplayText,
    Grid,
    UI_LEVELS_OFFSET,
} from "../../../core";

export class SettingsDisplayer extends Phaser.GameObjects.Container {
    private overlay!: Phaser.GameObjects.Rectangle;
    private panel!: Phaser.GameObjects.Rectangle;

    private gameModeTitle: DisplayText;
    private boardSizeTitle: DisplayText;

    constructor(scene: BaseScene) {
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
                { text: "Close", onClick: () => this.hide() },
            ).setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 3),
        );

        //Game Mode Setting
        this.gameModeTitle = new DisplayText(
            scene,
            panelGrid.getArea({ x: 1, y: 3, width: 2, margin: 5 }),
        )
            .setText("Game Mode :")
            .setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 3);
        this.add(
            new Button(scene, panelGrid.getArea({ x: 3, y: 3, margin: 5 }), {
                text: "Infinity",
                onClick: () => console.log("CHANGE GAME MODE TO INFINITY"),
            }).setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 3),
        );
        this.add(
            new Button(scene, panelGrid.getArea({ x: 4, y: 3, margin: 5 }), {
                text: "PVP",
                onClick: () => console.log("CHANGE GAME MODE TO PVP"),
            }).setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 3),
        );

        //Board Size Settings
        this.boardSizeTitle = new DisplayText(
            scene,
            panelGrid.getArea({ x: 1, y: 4, width: 2, margin: 5 }),
        )
            .setText("Board Size :")
            .setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 3);
        this.add(
            new Button(scene, panelGrid.getArea({ x: 3, y: 4, margin: 5 }), {
                text: "10",
                onClick: () => console.log("CHANGE GAME SIZE TO 10"),
            }).setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 3),
        );
        this.add(
            new Button(scene, panelGrid.getArea({ x: 4, y: 4, margin: 5 }), {
                text: "20",
                onClick: () => console.log("CHANGE GAME SIZE TO 20"),
            }).setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 3),
        );
        this.add(
            new Button(scene, panelGrid.getArea({ x: 5, y: 4, margin: 5 }), {
                text: "30",
                onClick: () => console.log("CHANGE GAME SIZE TO 30"),
            }).setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 3),
        );

        // Save
        this.add(
            new Button(
                scene,
                panelGrid.getArea({ x: 6, y: 9, width: 2, margin: 5 }),
                {
                    text: "Save",
                    onClick: () => console.log("Save settings"),
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
        this.overlay.setVisible(visible);
        this.panel.setVisible(visible);
        return this;
    }
}

