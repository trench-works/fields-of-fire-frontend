import { Scene } from "phaser";
import { Character } from "../../scenes/Fight/objects/Character";
import { GameObject } from "./GameObject";
import { scaleAndCenter } from "../Utils/Scale";
import { Position } from "../Types/Position";
import { Action } from "../../Model/Action";
import { PlayableCharacter } from "../../Model/PlayableCharacter";

export type SceneRenderConfig = {
    tileSize: number;
    renderType: string;
    offset: Position;
};

export type RenderResult = {
    position: Position;
    sprite: string;
};

export type Cell = {
    gridPosition: Position;
    pixelPosition: Position;
    zone: Phaser.GameObjects.Zone;
    hoverGraphics?: Phaser.GameObjects.Graphics;
};

export interface Displayable {
    render(renderConfig: SceneRenderConfig): RenderResult | RenderResult[];
}

export class GameScene extends Scene {
    public backgroundImage = "red_bg";
    public fightMap = "chessmap";
    public tileSetImage = "damier";
    public tileWidth = 64;
    public renderConfig: SceneRenderConfig | undefined;
    public displayObjects: Displayable[] = [];
    public gameObjects: GameObject[] = [];
    public characters: Character[] = [];
    public otherPlayers: PlayableCharacter[] = [];
    public myPlayer: PlayableCharacter | undefined;
    public gridPositions: Cell[][] = [];
    public scaleFactor: number = 1;

    spawnEntities() {
        this.characters.forEach((entity) => {
            //this.spawnCharacter(entity);
            entity.spawn(this, this.scaleFactor, this.gridPositions);
        });
    }

    generateMap() {
        const map = this.make.tilemap({ key: this.fightMap });
        const tileset = map.addTilesetImage(this.tileSetImage, "groundTiles");

        const centerMap = scaleAndCenter({
            parentHeight: this.scale.height,
            parentWidth: this.scale.width,
            childHeight: map.heightInPixels,
            childWidth: map.widthInPixels,
            isometricVariation: true,
        });

        if (!this.renderConfig) {
            throw new Error("Render config not defined");
        }

        this.renderConfig.offset.add(
            new Position(centerMap.offsetX, centerMap.offsetY),
        );

        const groundLayer = map.createLayer(
            "Ground",
            tileset!,
            centerMap.offsetX,
            centerMap.offsetY,
        );

        if (!groundLayer) {
            throw new Error("Ground layer seemingly inexistent");
        }

        this.scaleFactor = centerMap.scaleFactor;

        groundLayer.setScale(centerMap.scaleFactor);
        groundLayer.setDepth(0);

        this.generatePlayGrid(map, groundLayer);
    }

    generatePlayGrid(
        map: Phaser.Tilemaps.Tilemap,
        layer: Phaser.Tilemaps.TilemapLayer,
    ) {
        for (let y = 0; y < map.height; y++) {
            for (let x = 0; x < map.width; x++) {
                const tile = layer.getTileAt(x, y);
                if (!tile) continue;

                const worldX = tile.getCenterX();
                const worldY = tile.getCenterY();

                const zone = this.add.zone(worldX, worldY, 10, 10);

                const Yof = 16;
                const Xof = 32;

                const diamond = new Phaser.Geom.Polygon([
                    //point1 (left corner)
                    0 - Xof * this.scaleFactor,
                    (-tile.height * this.scaleFactor) / 4,
                    //point2 (top corner)
                    0,
                    (-tile.height * this.scaleFactor) / 2,
                    //point3 (right corner)
                    (tile.width * this.scaleFactor) / 2,
                    0 - Yof * this.scaleFactor,
                    //point4 (bottom corner)
                    0,
                    0,
                ]);

                const hoverGraphics = this.add.graphics();
                hoverGraphics.lineStyle(2, 0xffffff, 1); // contour blanc
                hoverGraphics.strokePoints(diamond.points, true);
                hoverGraphics.setPosition(worldX, worldY);
                hoverGraphics.setDepth(layer.depth + 5);
                hoverGraphics.setVisible(false);

                zone.setInteractive(diamond, Phaser.Geom.Polygon.Contains);
                zone.setDepth(layer.depth + 3);

                // --- DEBUG VISUEL ---
                this.gridShower(diamond, worldX, worldY, layer);

                if (!this.gridPositions[y]) {
                    this.gridPositions[y] = [];
                }

                this.gridPositions[y][x] = {
                    gridPosition: new Position(x, y),
                    pixelPosition: new Position(
                        worldX,
                        worldY - Yof * this.scaleFactor,
                    ),
                    zone,
                    hoverGraphics,
                };

                zone.on("pointerdown", () => {
                    console.log(`Tile clicked: ${x}, ${y}`);
                });
                zone.on("pointerover", () => {
                    hoverGraphics.setVisible(true);
                });
                zone.on("pointerout", () => {
                    hoverGraphics.setVisible(false);
                });

                (tile as any).zone = zone;
            }
        }
    }
    gridShower(
        diamond: Phaser.Geom.Polygon,
        worldX: number,
        worldY: number,
        layer: Phaser.Tilemaps.TilemapLayer,
    ) {
        const g = this.add.graphics();
        g.lineStyle(2, 0xff0000, 1); // contour rouge
        g.strokePoints(diamond.points, true);
        g.setPosition(worldX, worldY);
        g.setDepth(layer.depth + 4);
    }
}

