import { Button } from "./Button";
import { MenuPanel } from "./MenuPanel";
import { BaseScene } from "../Objects";

interface MenuButtonConfig {
    onResumeClick?: () => void;
    onSettingsClick?: () => void;
    onMainMenuClick?: () => void;
    position?: "topRight" | "topLeft" | "bottomRight" | "bottomLeft";
}

export class MenuButton {
    private button!: Button;
    private menuPanel!: MenuPanel;
    private scene: BaseScene;

    constructor(scene: BaseScene, config: MenuButtonConfig) {
        this.scene = scene;

        // Créer le panneau du menu
        this.menuPanel = new MenuPanel(scene, {
            onResumeClick: config.onResumeClick,
            onSettingsClick: config.onSettingsClick,
            onMainMenuClick: config.onMainMenuClick,
        });

        // Déterminer la position du bouton
        const positionConfig = this.getPosition(config.position);

        // Créer le bouton Menu
        this.button = new Button(
            scene,
            {
                x: positionConfig.x - 25,
                y: positionConfig.y - 25,
                width: 50,
                height: 50,
            },
            {
                text: "☰",
                fontSize: 32,
                onClick: () => {
                    this.menuPanel.toggle();
                },
            },
        );

        this.button.setScrollFactor(0);
        this.button.setDepth(9999);

        // Ajouter un écouteur pour la touche Échap
        scene.input.keyboard?.on("keydown-ESC", () => {
            this.menuPanel.toggle();
        });
    }

    private getPosition(
        position?: "topRight" | "topLeft" | "bottomRight" | "bottomLeft",
    ) {
        const padding = 30;
        const { width, height } = this.scene.scale;

        switch (position) {
            case "topLeft":
                return { x: padding + 30, y: padding + 30 };
            case "bottomRight":
                return { x: width - padding - 30, y: height - padding - 30 };
            case "bottomLeft":
                return { x: padding + 30, y: height - padding - 30 };
            case "topRight":
            default:
                return { x: width - padding - 30, y: padding + 30 };
        }
    }

    public show() {
        this.button?.setVisible(true);
    }

    public hide() {
        this.button?.setVisible(false);
    }

    public closeMenu() {
        this.menuPanel?.hide();
    }

    public getMenuPanel(): MenuPanel {
        return this.menuPanel;
    }
}

