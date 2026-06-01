import { Scene } from "phaser";
import { Character } from "./objects/Character";
import { GameObject } from "../../core/Objects/GameObject";
import { scaleAndCenter } from "../../core/Utils/Scale";
import { Position } from "../../core/Types/Position";
import { RangeVisualizer } from "./objects/RangeVisualizer";
import { ActionManager } from "./objects/ActionManager";
import { Game } from "../../Model/Game";
import { Diamond } from "../../core/Objects/Diamond";
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

    public gamePayload!: Game;

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

                if (
                    caseTile.entityId &&
                    caseTile.entityId === game.playerTurns[0]
                ) {
                    const entity = game.entities.find(
                        (entity) => entity.entityId === caseTile.entityId,
                    );
                    if (entity) {
                        this.entityHighlights.push(
                            this.getTileHighlights(tile, {
                                color:
                                    entity.entityType === EntityType.ALLY
                                        ? 0x00ff00
                                        : 0xff0000,
                                depth: 2,
                            }),
                        );
                    }
                }
            }
        }
    }

    private generatePlayGrid(
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

                const hoverGraphics = this.getTileHighlights(tile, {
                    color: 0xffffff,
                    diamond,
                    depth: 2,
                });
                hoverGraphics.setVisible(false);

                const zone = this.getTileInteractiveZone(tile, {
                    diamond,
                });

                // --- DEBUG VISUEL ---
                //this.gridShower(diamond, worldX, worldY, layer);

                const worldX = tile.getCenterX();
                const worldY = tile.getCenterY();
                if (!this.gridPositions[y]) {
                    this.gridPositions[y] = [];
                }

                this.gridPositions[x][y] = {
                    gridPosition: new Position(x, y),
                    pixelPosition: new Position(
                        worldX,
                        worldY - 16 * this.scaleFactor,
                    ),
                    zone,
                    hoverGraphics,
                };

                zone.on("pointerdown", () => {
                    console.log(`Tile clicked: ${x}, ${y}`);

                    if (rangeVisualizer.isInRange(new Position(x, y))) {
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
    getTileHighlights(
        tile: Phaser.Tilemaps.Tile,
        props?: { color: number; diamond?: Diamond; depth?: number },
    ): Phaser.GameObjects.Graphics {
        let diamond: Diamond | undefined = props?.diamond;
        if (!diamond) {
            diamond = new Diamond(tile, this.scaleFactor);
        }
        const worldX = tile.getCenterX();
        const worldY = tile.getCenterY();

        // Create Graphic
        const graphics = this.add.graphics();
        graphics.lineStyle(2, props?.color ?? 0xffffff, 1);
        graphics.strokePoints(diamond.points, true);
        graphics.setPosition(worldX, worldY);
        graphics.setDepth(this.groundLayer?.depth ?? 0 + (props?.depth ?? 1));

        return graphics;
    }

    getTileInteractiveZone(
        tile: Phaser.Tilemaps.Tile,
        props?: { diamond?: Diamond },
    ): Phaser.GameObjects.Zone {
        let diamond: Diamond | undefined = props?.diamond;
        if (!diamond) {
            diamond = new Diamond(tile, this.scaleFactor);
        }
        const worldX = tile.getCenterX();
        const worldY = tile.getCenterY();

        // Create Zone
        const zone = this.add.zone(worldX, worldY, 10, 10);
        zone.setInteractive(diamond, Phaser.Geom.Polygon.Contains);
        zone.setDepth(this.groundLayer?.depth ?? 0 + 2);
        return zone;
    }
}

