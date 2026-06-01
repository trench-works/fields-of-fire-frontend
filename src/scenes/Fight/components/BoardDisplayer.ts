import { Position } from "../../../core";
import { Diamond } from "../../../core/Objects/Diamond";
import { scaleAndCenter } from "../../../core/Utils/Scale";
import { EntityType } from "../../../Model/Entity";
import { FightSceneDisplayer } from "./FightSceneDisplayer";

export class BoardDisplayer extends FightSceneDisplayer {
    private entityHighlights: Phaser.GameObjects.Graphics[] = [];
    private groundLayer: Phaser.Tilemaps.TilemapLayer | null = null;

    preRender(): this {
        return this;
    }
    render(): this {
        const map = this.scene.make.tilemap({
            key: this.scene.fightMap,
        });
        const tileset = map.addTilesetImage(
            this.scene.tileSetImage,
            "groundTiles",
        );

        const centerMap = scaleAndCenter({
            parentHeight: this.scene.scale.height,
            parentWidth: this.scene.scale.width,
            childHeight: map.heightInPixels,
            childWidth: map.widthInPixels,
            isometricVariation: true,
        });

        if (!this.scene.renderConfig) {
            throw new Error("Render config not defined");
        }

        this.scene.renderConfig.offset.add(
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

        this.scene.scaleFactor = centerMap.scaleFactor;

        this.groundLayer.setScale(centerMap.scaleFactor);
        this.groundLayer.setDepth(0);

        this.generatePlayGrid();
        this.displayEntitiesHighlights();
        return this;
    }

    private displayEntitiesHighlights() {
        if (!this.groundLayer) {
            return;
        }
        for (const highlightEntity of this.entityHighlights) {
            highlightEntity.destroy();
        }
        this.entityHighlights = [];
        for (let x = 0; x < this.gameStore.game.plateau.length; x++) {
            for (let y = 0; y < this.gameStore.game.plateau.length; y++) {
                const tile = this.groundLayer.getTileAt(x, y);
                const caseTile = this.gameStore.game.plateau[x][y];
                if (caseTile.isHole || caseTile.isWall) {
                    tile.setVisible(false);
                    continue;
                }
                if (!tile) continue;

                if (
                    caseTile.entityId &&
                    caseTile.entityId === this.gameStore.game.playerTurns[0]
                ) {
                    const entity = this.gameStore.game.entities.find(
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

    private generatePlayGrid() {
        if (!this.groundLayer) {
            return;
        }
        for (let x = 0; x < this.gameStore.game.plateau.length; x++) {
            for (let y = 0; y < this.gameStore.game.plateau.length; y++) {
                const tile = this.groundLayer.getTileAt(x, y);
                const caseTile = this.gameStore.game.plateau[x][y];
                if (caseTile.isHole || caseTile.isWall) {
                    tile.setVisible(false);
                    continue;
                }
                if (!tile) continue;
                const diamond = new Diamond(tile, this.scene.scaleFactor);

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
                if (!this.scene.gridPositions[y]) {
                    this.scene.gridPositions[y] = [];
                }

                this.scene.gridPositions[x][y] = {
                    gridPosition: new Position(x, y),
                    pixelPosition: new Position(
                        worldX,
                        worldY - 16 * this.scene.scaleFactor,
                    ),
                    zone,
                    hoverGraphics,
                };

                zone.on("pointerdown", () => {
                    console.log(`Tile clicked: ${x}, ${y}`);

                    if (
                        this.scene.rangeVisualizer.isInRange(new Position(x, y))
                    ) {
                        this.scene.actionManager.launchAction(
                            new Position(x, y),
                        );
                    }

                    this.scene.rangeVisualizer.clearRange();
                });
                zone.on("pointerover", () => {
                    hoverGraphics.setVisible(true);
                });
                zone.on("pointerout", () => {
                    hoverGraphics.setVisible(false);
                });

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            diamond = new Diamond(tile, this.scene.scaleFactor);
        }
        const worldX = tile.getCenterX();
        const worldY = tile.getCenterY();

        // Create Graphic
        const graphics = this.scene.add.graphics();
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
            diamond = new Diamond(tile, this.scene.scaleFactor);
        }
        const worldX = tile.getCenterX();
        const worldY = tile.getCenterY();

        // Create Zone
        const zone = this.scene.add.zone(worldX, worldY, 10, 10);
        zone.setInteractive(diamond, Phaser.Geom.Polygon.Contains);
        zone.setDepth(this.groundLayer?.depth ?? 0 + 2);
        return zone;
    }

    update(): this {
        this.displayEntitiesHighlights();
        return this;
    }
}

