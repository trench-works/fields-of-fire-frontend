import { Color } from "../../config/ColorConfig";
import { BaseScene } from "../Objects";
import { Position, Size } from "../Types";
import { GridArea } from "../Utils";
import { Displayable } from "./DisplayRoot";

export type InputProps = {
    onChange?: (value: string) => void;
    onEnter?: (value: string) => void;
    placeholder?: string;
    area: GridArea;
    depth: number;
    isPassword?: boolean;
    value?: string;
};

export class DisplayInput
    extends Phaser.GameObjects.GameObject
    implements Displayable
{
    recalculate(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    private inputElement: HTMLInputElement;

    constructor(
        scene: BaseScene,
        {
            onEnter,
            onChange,
            placeholder,
            area,
            depth,
            isPassword = false,
            value = "",
        }: InputProps,
    ) {
        super(scene, "input");
        this.inputElement = document.createElement("input");
        this.inputElement.type = isPassword ? "password" : "text";
        if (placeholder) {
            this.inputElement.placeholder = placeholder;
        }
        this.inputElement.value = value;
        Object.assign(this.inputElement.style, {
            position: "absolute",
            left: `${area.x}px`,
            top: `${area.y}px`,
            width: `${area.width - 22}px`,
            height: `${area.height - 2}px`,
            fontSize: "16px",
            padding: "0 10px",
            borderRadius: "6px",
            border: "1px solid #555",
            background: "#1a1a2e",
            color: Color.TEXT,
            outline: "none",
            zIndex: `${depth}`,
        });
        document.body.appendChild(this.inputElement);
        this.inputElement.addEventListener("keydown", (e) => {
            onChange?.(this.inputElement.value);
            if (e.key === "Enter") {
                onEnter?.(this.inputElement.value);
            }
        });
    }
    blur(): this {
        throw new Error("Method not implemented.");
    }
    unblur(): this {
        throw new Error("Method not implemented.");
    }

    focus(): this {
        this.inputElement.focus();
        return this;
    }

    setVisible(visible: boolean): void {
        if (visible) {
            this.inputElement.style.display = "block";
        } else {
            this.inputElement.style.display = "none";
        }
    }

    destroy(): void {
        this.inputElement.remove();
    }

    getObject(): Phaser.GameObjects.GameObject {
        throw new Error("Method not implemented.");
    }

    place(area: Position & Size): void {
        Object.assign(this.inputElement.style, {
            left: `${area.x}px`,
            top: `${area.y}px`,
            width: `${area.width}px`,
            height: `${area.height}px`,
        });
    }

    setDepth(depth: number): this {
        this.inputElement.style.zIndex = `${depth}`;
        return this;
    }
}

