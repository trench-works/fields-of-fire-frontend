import Phaser from "phaser";
import { Button } from "./Button";
import { Color } from "../../config/ColorConfig";
import { BaseScene } from "../Objects";
import { Depth, UI_LEVELS_OFFSET } from "../Utils";
import { i18n } from "../i18n";

export type MenuPanelButton = {
    title: string;
    onClick: () => void;
};

export class MenuPanel extends Phaser.GameObjects.Container {
    private overlay!: Phaser.GameObjects.Rectangle;
    private panel!: Phaser.GameObjects.Rectangle;
    private isVisible: boolean = false;

    constructor(scene: BaseScene, configs: MenuPanelButton[]) {
        super(scene, 0, 0);
        scene.add.existing(this);
        this.setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP_2));

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
            .setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP_2) + 1);
        this.add(this.overlay);

        // Créer le panneau du menu
        this.panel = scene.add
            .rectangle(
                scene.scale.width / 2,
                scene.scale.height / 2,
                600,
                500,
                Phaser.Display.Color.HexStringToColor(
                    Color.CONTAINER_BACKGROUND,
                ).color,
            )
            .setScrollFactor(0)
            .setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP_2) + 2)
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
            .setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP_2) + 3);
        this.add(titleText);

        let i = 0;
        for (const config of configs) {
            const button = new Button(
                scene,
                {
                    x: scene.scale.width / 2 - 150,
                    y: scene.scale.height / 2 + (-80 + 80 * i) - 25,
                    width: 300,
                    height: 50,
                },
                {
                    text: config.title,
                    fontSize: 24,
                    onClick: () => {
                        this.hide();
                        config.onClick?.();
                    },
                },
            )
                .setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP_2) + 3)
                .setScrollFactor(0);
            this.add(button);
            i++;
        }

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

