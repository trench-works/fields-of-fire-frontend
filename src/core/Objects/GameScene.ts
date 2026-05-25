import { Scene } from "phaser";
import { Character } from "../../scenes/Fight/objects/Character";
import { GameObject } from "./GameObject";
import { scaleAndCenter } from "../Utils/Scale";
import { Position } from "../Types/Position";
import { RangeVisualizer } from "../../scenes/Fight/objects/RangeVisualizer";
import { ActionManager } from "../../scenes/Fight/objects/ActionManager";
import { ActionAssetId } from "../../assets";
import { Game } from "../../Model/Game";
import { Diamond } from "./Diamond";
import { EntityType } from "../../Model/Entity";

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
    public tileSetImage = "ground";
    public tileWidth = 64;
    public renderConfig: SceneRenderConfig | undefined;
    public displayObjects: Displayable[] = [];
    public gameObjects: GameObject[] = [];
    public characters: Character[] = [];
    public myPlayer!: Character;
    public gridPositions: Cell[][] = [];
    public scaleFactor: number = 1;

    protected groundLayer: Phaser.Tilemaps.TilemapLayer | null = null;
    private entityHighlights: Phaser.GameObjects.Graphics[] = [];

    spawnEntities() {
        this.characters.forEach((entity) => {
            entity.spawn(this, this.scaleFactor, this.gridPositions);
        });
    }

    generateMap(
        actionManager: ActionManager,
        rangeVisualizer: RangeVisualizer,
        game: Game,
    ) {
        const map = this.make.tilemap({
            key: this.fightMap,
        });
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

        this.groundLayer = map.createLayer(
            "Ground",
            tileset!,
            centerMap.offsetX,
            centerMap.offsetY,
        );

        if (!this.groundLayer) {
            throw new Error("Ground layer seemingly inexistent");
        }

        this.scaleFactor = centerMap.scaleFactor;

        this.groundLayer.setScale(centerMap.scaleFactor);
        this.groundLayer.setDepth(0);

        this.generatePlayGrid(actionManager, rangeVisualizer, game);
        this.displayEntitiesHighlights(game);
    }

    displayEntitiesHighlights(game: Game) {
        if (!this.groundLayer) {
            return;
        }
        for (const highlightEntity of this.entityHighlights) {
            highlightEntity.destroy();
        }
        this.entityHighlights = [];
        for (let x = 0; x < game.plateau.length; x++) {
            for (let y = 0; y < game.plateau.length; y++) {
                const tile = this.groundLayer.getTileAt(x, y);
                const caseTile = game.plateau[x][y];
                if (caseTile.isHole || caseTile.isWall) {
                    tile.setVisible(false);
                    continue;
                }
                if (!tile) continue;

                const worldX = tile.getCenterX();
                const worldY = tile.getCenterY();

                if (caseTile.entityId) {
                    const entity = game.entities.find(
                        (entity) => entity.entityId === caseTile.entityId,
                    );
                    if (entity) {
                        const hoverGraphics = this.add.graphics();
                        hoverGraphics.lineStyle(
                            2,
                            entity.entityType === EntityType.ALLY
                                ? 0x00ff00
                                : 0xff0000,
                            1,
                        ); // contour blanc
                        hoverGraphics.strokePoints(
                            new Diamond(tile, this.scaleFactor).points,
                            true,
                        );
                        hoverGraphics.setPosition(worldX, worldY);
                        hoverGraphics.setVisible(true);
                        hoverGraphics.setDepth(this.groundLayer.depth + 3);
                        this.entityHighlights.push(hoverGraphics);
                    }
                }
            }
        }
    }

    generatePlayGrid(
        actionManager: ActionManager,
        rangeVisualizer: RangeVisualizer,
        game: Game,
    ) {
        if (!this.groundLayer) {
            return;
        }
        for (let x = 0; x < game.plateau.length; x++) {
            for (let y = 0; y < game.plateau.length; y++) {
                const tile = this.groundLayer.getTileAt(x, y);
                const caseTile = game.plateau[x][y];
                if (caseTile.isHole || caseTile.isWall) {
                    tile.setVisible(false);
                    continue;
                }
                if (!tile) continue;
                const diamond = new Diamond(tile, this.scaleFactor);

                const worldX = tile.getCenterX();
                const worldY = tile.getCenterY();

                const Yof = 16;

                const zone = this.add.zone(
                    worldX,
                    worldY,
                    game.plateau.length,
                    game.plateau.length,
                );

                const hoverGraphics = this.add.graphics();
                hoverGraphics.lineStyle(2, 0xffffff, 1); // contour blanc
                hoverGraphics.strokePoints(diamond.points, true);
                hoverGraphics.setPosition(worldX, worldY);
                hoverGraphics.setDepth(this.groundLayer.depth + 5);
                hoverGraphics.setVisible(false);

                zone.setInteractive(diamond, Phaser.Geom.Polygon.Contains);
                zone.setDepth(this.groundLayer.depth + 3);

                // --- DEBUG VISUEL ---
                //this.gridShower(diamond, worldX, worldY, layer);

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

                    const rangeManager: number | undefined =
                        actionManager.currentAction?.id === ActionAssetId.WALK
                            ? this.myPlayer.stats.mouvement
                            : actionManager.currentAction?.range;

                    if (
                        rangeVisualizer.isItInRange(
                            this.myPlayer.entity.position,
                            rangeManager!,
                            new Position(x, y),
                        )
                    ) {
                        actionManager.launchAction(new Position(x, y));
                    }

                    rangeVisualizer.clearRange();
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

