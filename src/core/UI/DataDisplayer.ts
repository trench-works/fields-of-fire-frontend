import { Position, Size, TwoAxis } from "../Types";
import { Grid } from "../Utils";
import { Button } from "./Button";
import { CustomContainer } from "./Container";

export type CellValue = string | number | { icon: string };

export interface DataDisplayerConfig {
    position: Position;
    size: Size;
    division: TwoAxis;
}

export interface CellArea {
    position: Position;
    width: number;
    height: number;
}

export type DataDisplayObject = Phaser.GameObjects.GameObject &
    Phaser.GameObjects.Components.Alpha;

export class List extends CustomContainer {
    private cellAreas: CellArea[][] = [];

    constructor(scene: Phaser.Scene, grid: Grid) {
        super(scene, {
            x: grid.center.x,
            y: grid.center.y,
            width: grid.width,
            height: grid.height,
            opacity: 0,
        });

        for (let r = 0; r < grid.division.vertical; r++) {
            this.cellAreas[r] = [];

            for (let c = 0; c < grid.division.horizontal; c++) {
                const area = grid.getArea({
                    x: c + 1,
                    y: r + 1,
                    width: 1,
                    height: 1,
                });

                this.cellAreas[r][c] = {
                    position: {
                        x: area.center.x,
                        y: area.center.y,
                    },
                    width: area.width,
                    height: area.height,
                };
            }
        }
    }

    public placeButton(
        { x, y }: Position,
        { icon, onClick }: { icon: string; onClick: () => void },
    ): Button {
        const area = this.cellAreas[y]?.[x];
        return new Button(this.scene, {
            x: area.position.x,
            y: area.position.y,
            width: area.width,
            height: area.height,
            image: icon,
            onClick,
        });
    }

    public placeText(
        x: number,
        y: number,
        value: string | number,
    ): Phaser.GameObjects.Text {
        const area = this.cellAreas[y]?.[x];
        const obj = this.scene.add
            .text(0, 0, value.toString(), {
                fontSize: "20px",
                color: "#fff",
            })
            .setOrigin(0.5);
        obj.setPosition(area.position.x, area.position.y);
        this.add(obj);
        return obj;
    }

    public placeContent(
        x: number,
        y: number,
        value:
            | string
            | number
            | { icon: string; onClick?: () => void; alpha?: number },
        iconSize?: number,
    ): Phaser.GameObjects.GameObject {
        const area = this.cellAreas[y]?.[x];

        let obj: Phaser.GameObjects.Image | Phaser.GameObjects.Text;

        if (typeof value === "string" || typeof value === "number") {
            obj = this.scene.add
                .text(0, 0, value.toString(), {
                    fontSize: "20px",
                    color: "#fff",
                })
                .setOrigin(0.5);
        } else if (value.icon) {
            obj = this.scene.add.image(0, 0, value.icon);
            obj.setDisplaySize(iconSize || 32, iconSize || 32);
            obj.setAlpha(value.alpha ?? 1);

            // --- AJOUT : rendre l’icône interactive si onClick existe ---
            if (value.onClick) {
                obj.setInteractive({ useHandCursor: true });
                obj.on("pointerdown", () => value.onClick!());
            }
        } else {
            throw new Error("Invalid value type");
        }

        obj.setPosition(area.position.x, area.position.y);
        this.add(obj);

        return obj;
    }
}

