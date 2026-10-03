import Phaser from "phaser";
import {
    BaseScene,
    Button,
    Depth,
    DisplayContainer,
    i18n,
    DisplayInput,
    UI_LEVELS_OFFSET,
    DisplayText,
} from "../../../core";

interface PopupInputConfig {
    title: string;
    onValidate: (username: string, password: string) => Promise<boolean>;
    onCancel?: () => void;
}

export class PopupInput {
    private overlay: Phaser.GameObjects.Rectangle;
    private title: DisplayText;
    private container: DisplayContainer;
    private validateButton: Button;
    private usernameInput: DisplayInput;
    private passwordInput: DisplayInput;

    private username: string = "";
    private password: string = "";

    constructor(scene: BaseScene, config: PopupInputConfig) {
        const { title, onValidate, onCancel } = config;

        const popupArea = scene.rootGrid.getArea({
            x: 2.5,
            y: 3,
            width: 2,
            height: 3,
        });

        const popupGrid = popupArea.getGrid({
            division: {
                vertical: 5,
                horizontal: 5,
            },
            margin: 20,
            padding: 5,
        });

        // --- OVERLAY ---
        this.overlay = scene.add
            .rectangle(
                scene.scale.width / 2,
                scene.scale.height / 2,
                scene.scale.width,
                scene.scale.height,
                0x000000,
                0.6,
            )
            .setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP))
            .setInteractive()
            .on("pointerdown", () => {
                onCancel?.();
                this.destroy();
            });

        // --- CONTAINER ---
        this.container = new DisplayContainer(scene, popupArea, {
            borderWidth: 2,
            opacity: 0.95,
            fontSize: 30,
        })
            .setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 1)
            .setInteractive()
            .on(
                "pointerdown",
                (
                    pointer: Phaser.Input.Pointer,
                    x: number,
                    y: number,
                    event: Phaser.Types.Input.EventData,
                ) => {
                    event.stopPropagation();
                },
            );
        this.title = new DisplayText(
            scene,
            popupGrid.getArea({ x: 2, y: 1, width: 3 }),
        )
            .setText(title)
            .setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 2);

        // --- INPUT HTML ---
        this.usernameInput = new DisplayInput(scene, {
            onChange: (value) => {
                this.username = value;
            },
            area: popupGrid.getArea({ x: 2, y: 3, width: 3 }),
            depth: Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 2,
            placeholder: i18n.translate(
                "mainMenu.registerPopup.username.placeholder",
            ),
        }).focus();
        this.passwordInput = new DisplayInput(scene, {
            onChange: (value) => {
                this.password = value;
            },
            onEnter: () => {
                onValidate(this.username, this.password).then((retour) => {
                    if (retour) {
                        this.destroy();
                    }
                });
            },
            area: popupGrid.getArea({ x: 2, y: 4, width: 3 }),
            depth: Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 2,
            placeholder: i18n.translate(
                "mainMenu.registerPopup.password.placeholder",
            ),
        });
        // --- BOUTON VALIDER (positionné dans le container) ---
        this.validateButton = new Button(
            scene,
            popupGrid.getArea({ x: 2, y: 5, width: 3 }),
            {
                text: i18n.translate("common.validate"),
                onClick: () => {
                    onValidate(this.username, this.password).then((retour) => {
                        if (retour) {
                            this.destroy();
                        }
                    });
                },
            },
        )
            .setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 2)
            .setInteractive()
            .on(
                "pointerdown",
                (
                    pointer: Phaser.Input.Pointer,
                    x: number,
                    y: number,
                    event: Phaser.Types.Input.EventData,
                ) => {
                    event.stopPropagation();
                },
            );
    }

    public destroy() {
        this.usernameInput.destroy();
        this.passwordInput.destroy();
        this.overlay.destroy();
        this.title.destroy();
        this.container.destroy();
        this.validateButton.destroy(); // ← nettoyage du bouton
    }
}

