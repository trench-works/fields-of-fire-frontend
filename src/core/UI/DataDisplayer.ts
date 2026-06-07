import { Position, UiGrid } from "../Types";
import { GridUtils } from "../Utils";
import { CustomContainer } from "./Container";

export type CellValue = string | number | { icon: string };

export interface DataDisplayerConfig {
    position: Position;
    width: number;
    height: number;
    cols: number;
    rows: number;
}

export interface CellArea {
    position: Position;
    width: number;
    height: number;
}

export type DataDisplayObject = Phaser.GameObjects.GameObject &
    Phaser.GameObjects.Components.Alpha;

export class DataDisplayer extends CustomContainer {
    private grid: UiGrid;
    private cellAreas: CellArea[][] = [];

    constructor(scene: Phaser.Scene, config: DataDisplayerConfig) {
        super(scene, {
            x: config.position.x,
            y: config.position.y,
            width: config.width,
            height: config.height,
            title: "",
            opacity: 0,
        });

        const { cols, rows } = config;

        this.grid = GridUtils.uiGrid(0, 0, this.width, this.height, cols, rows);

        for (let r = 0; r < rows; r++) {
            this.cellAreas[r] = [];

            for (let c = 0; c < cols; c++) {
                const area = this.grid.getArea(c, r, 1, 1);

                this.cellAreas[r][c] = {
                    position: new Position(
                        -this.width / 2 + area.centerX,
                        -this.height / 2 + area.centerY,
                    ),
                    width: area.width,
                    height: area.height,
                };
            }
        }
    }

    public placeText(
        col: number,
        row: number,
        value: string | number,
    ): Phaser.GameObjects.Text {
        const area = this.cellAreas[row]?.[col];
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
        col: number,
        row: number,
        value:
            | string
            | number
            | { icon: string; onClick?: () => void; alpha?: number },
        iconSize?: number,
    ): DataDisplayObject {
        const area = this.cellAreas[row]?.[col];

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

