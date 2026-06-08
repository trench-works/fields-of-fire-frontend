import Phaser from "phaser";
import { Button, CustomContainer } from "../../../core";

interface PopupInputConfig {
    title: string;
    placeholder?: string;
    onValidate: (value: string) => Promise<boolean>;
    onCancel?: () => void;
}

export class PopupInput {
    private overlay: Phaser.GameObjects.Rectangle;
    private container: CustomContainer;
    private validateButton: Button;
    private inputElement: HTMLInputElement;

    constructor(scene: Phaser.Scene, config: PopupInputConfig) {
        const { title, placeholder = "", onValidate, onCancel } = config;
        const cx = scene.scale.width / 2;
        const cy = scene.scale.height / 2;
        const popupW = 400;
        const popupH = 220;

        // --- OVERLAY ---
        this.overlay = scene.add
            .rectangle(
                cx,
                cy,
                scene.scale.width,
                scene.scale.height,
                0x000000,
                0.6,
            )
            .setDepth(10)
            .setInteractive()
            .on("pointerdown", () => {
                onCancel?.();
                this.destroy();
            });

        // --- CONTAINER ---
        this.container = new CustomContainer(scene, {
            title,
            x: cx,
            y: cy,
            width: popupW,
            height: popupH,
            borderWidth: 2,
            opacity: 0.95,
            fontSize: 20,
            textPosition: { x: 0, y: -popupH / 2 + 25 },
        });
        this.container.setDepth(11);
        this.container
            .setDepth(11)
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

        // --- INPUT HTML ---
        this.inputElement = document.createElement("input");
        this.inputElement.type = "text";
        this.inputElement.placeholder = placeholder;
        Object.assign(this.inputElement.style, {
            position: "absolute",
            left: `${cx - 150}px`,
            top: `${cy - 20}px`,
            width: "300px",
            height: "36px",
            fontSize: "16px",
            padding: "0 10px",
            borderRadius: "6px",
            border: "1px solid #555",
            background: "#1a1a2e",
            color: "#ffffff",
            outline: "none",
            zIndex: "100",
        });
        document.body.appendChild(this.inputElement);
        this.inputElement.focus();

        // --- BOUTON VALIDER (positionné dans le container) ---
        this.validateButton = new Button(scene, {
            text: "Valider",
            x: cx,
            y: cy + 70,
            width: 160,
            height: 40,
            onClick: () => {
                onValidate(this.inputElement.value).then((retour) => {
                    if (retour) {
                        this.destroy();
                    }
                });
            },
        });
        this.validateButton.setDepth(12);

        this.validateButton
            .setDepth(12)
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

        // --- ENTER pour valider ---
        this.inputElement.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                onValidate(this.inputElement.value);
                this.destroy();
            }
        });
    }

    public destroy() {
        this.inputElement.remove();
        this.overlay.destroy();
        this.container.destroy();
        this.validateButton.destroy(); // ← nettoyage du bouton
    }
}

