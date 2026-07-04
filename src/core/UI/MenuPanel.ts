import Phaser from "phaser";
import { Button } from "./Button";
import { Color } from "../../config/ColorConfig";
import { BaseScene } from "../Objects";
import { Depth, UI_LEVELS_OFFSET } from "../Utils";
import { i18n } from "../i18n";

interface MenuPanelConfig {
    onResumeClick?: () => void;
    onSettingsClick?: () => void;
    onMainMenuClick?: () => void;
}

export class MenuPanel extends Phaser.GameObjects.Container {
    private overlay!: Phaser.GameObjects.Rectangle;
    private panel!: Phaser.GameObjects.Rectangle;
    private isVisible: boolean = false;

    constructor(scene: BaseScene, config: MenuPanelConfig) {
        super(scene, 0, 0);
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
        this.panel = scene.add
            .rectangle(
                scene.scale.width / 2,
                scene.scale.height / 2,
                600,
                500,
                Phaser.Display.Color.HexStringToColor(Color.containerBg).color,
            )
            .setScrollFactor(0)
            .setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 2)
            .setStrokeStyle(3, 0xffffff);
        this.add(this.panel);

        // Titre du menu
        const titleText = scene.add
            .text(
                scene.scale.width / 2,
                scene.scale.height / 2 - 180,
                i18n.translate("menuPanel.title"),
                {
                    fontFamily: "MyFont",
                    fontSize: "60px",
                    color: "#FFFFFF",
                },
            )
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 3);
        this.add(titleText);

        // Bouton Reprendre
        const resumeButton = new Button(
            scene,
            {
                x: scene.scale.width / 2 - 150,
                y: scene.scale.height / 2 - 80 - 25,
                width: 300,
                height: 50,
            },
            {
                text: i18n.translate("menuPanel.back"),
                fontSize: 24,
                onClick: () => {
                    this.hide();
                    config.onResumeClick?.();
                },
            },
        )
            .setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 3)
            .setScrollFactor(0);
        this.add(resumeButton);

        // Bouton Paramètres
        const settingsButton = new Button(
            scene,
            {
                x: scene.scale.width / 2 - 150,
                y: scene.scale.height / 2 - 25,
                width: 300,
                height: 50,
            },
            {
                text: i18n.translate("menuPanel.options"),
                fontSize: 24,
                onClick: () => {
                    this.hide();
                    config.onSettingsClick?.();
                },
            },
        )
            .setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 3)
            .setScrollFactor(0);
        this.add(settingsButton);

        // Bouton Retour au Menu Principal
        const mainMenuButton = new Button(
            scene,
            {
                x: scene.scale.width / 2 - 150,
                y: scene.scale.height / 2 + 80 - 25,
                width: 300,
                height: 50,
            },
            {
                text: i18n.translate("menuPanel.mainMenu"),
                fontSize: 24,
                onClick: () => {
                    this.hide();
                    config.onMainMenuClick?.();
                },
            },
        )
            .setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 3)
            .setScrollFactor(0);
        this.add(mainMenuButton);

        // Masquer le panneau par défaut
        this.hide();
    }

    public show() {
        this.isVisible = true;
        this.setVisible(true);
    }

    public hide() {
        this.isVisible = false;
        this.setVisible(false);
    }

    public toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    public getIsVisible(): boolean {
        return this.isVisible;
    }
}

