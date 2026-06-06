import { MiscAsset, MiscAssetId } from "../../../assets";
import { Position } from "../../../core";
import { Diamond } from "../../../core/Objects/Diamond";
import { scaleAndCenter } from "../../../core/Utils/Scale";
import { EntityType } from "../../../Model/Entity";
import { FightScene } from "../fight.scene";
import { ClassStore } from "../stores/ClassStore";
import { GameStore } from "../stores/GameStore";
import { PlayerStore } from "../stores/PlayerStore";
import { FightSceneDisplayer } from "./FightSceneDisplayer";

export class BoardDisplayer extends FightSceneDisplayer {
    private entityHighlights: Phaser.GameObjects.Graphics[] = [];
    private groundLayer: Phaser.Tilemaps.TilemapLayer | null = null;
    private wallLayer: Phaser.Tilemaps.TilemapLayer | null = null;

    constructor(
        scene: FightScene,
        gameStore: GameStore,
        private readonly classStore: ClassStore,
        private readonly playerStore: PlayerStore,
    ) {
        super(scene, gameStore);
    }

    preRender(): this {
        return this;
    }
    render(): this {
        const map = this.scene.make.tilemap({
            key: this.scene.fightMap,
        });
        const tileset = map.addTilesetImage(
            MiscAssetId.GROUND_TILE,
            MiscAsset.getAssetKey(MiscAssetId.GROUND_TILE),
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
        this.scene.scaleFactor = centerMap.scaleFactor;

        this.groundLayer = map.createLayer(
            "Ground",
            tileset!,
            centerMap.offsetX,
            centerMap.offsetY,
        );
        this.wallLayer = map.createLayer(
            "Wall",
            tileset!,
            centerMap.offsetX,
            centerMap.offsetY - 32 * this.scene.scaleFactor,
        );

        if (!this.groundLayer) {
            throw new Error("Ground layer seemingly inexistent");
        }
        if (!this.wallLayer) {
            throw new Error("Wall layer seemingly inexistent");
        }

        this.groundLayer.setScale(this.scene.scaleFactor);
        this.groundLayer.setDepth(0);
        this.wallLayer.setScale(this.scene.scaleFactor);
        this.wallLayer.setDepth(1);

        this.generatePlayGrid();
        this.displayEntitiesHighlights();
        return this;
    }

    private displayEntitiesHighlights() {
        if (!this.groundLayer || !this.wallLayer) {
            return;
        }
        for (const highlightEntity of this.entityHighlights) {
            highlightEntity.destroy();
        }
        this.entityHighlights = [];
        for (let x = 0; x < this.gameStore.game.plateau.length; x++) {
            for (let y = 0; y < this.gameStore.game.plateau.length; y++) {
                const caseTile = this.gameStore.game.plateau[x][y];
                // Ground part
                const tile = this.groundLayer.getTileAt(x, y);
                if (tile) {
                    if (caseTile.isHole) {
                        tile.setVisible(false);
                    } else if (!caseTile.isWall) {
                        if (
                            caseTile.entityId &&
                            caseTile.entityId ===
                                this.gameStore.game.playerTurns[0]
                        ) {
                            const entity = this.gameStore.game.entities.find(
                                (entity) =>
                                    entity.entityId === caseTile.entityId,
                            );
                            if (entity) {
                                this.entityHighlights.push(
                                    this.getTileHighlights(tile, {
                                        color:
                                            entity.entityType ===
                                            EntityType.ALLY
                                                ? 0x00ff00
                                                : 0xff0000,
                                        depth: 2,
                                    }),
                                );
                            }
                        }
                    }
                }

                // Wall part
                const wallTile = this.wallLayer.getTileAt(x, y);
                if (wallTile) {
                    if (caseTile.isWall) {
                        //changer la depth de la wallTile
                    } else {
                        wallTile.setVisible(false);
                    }
                }
            }
        }
    }

    private generatePlayGrid() {
        if (!this.groundLayer || !this.wallLayer) {
            return;
        }
        for (let x = 0; x < this.gameStore.game.plateau.length; x++) {
            for (let y = 0; y < this.gameStore.game.plateau.length; y++) {
                const tile = this.groundLayer.getTileAt(x, y);
                const caseTile = this.gameStore.game.plateau[x][y];
                if (caseTile.isHole) {
                    tile.setVisible(false);
                } else if (!caseTile.isWall) {
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
                        if (this.scene.actionManager.currentAction) {
                            if (
                                this.scene.rangeVisualizer.isInRange(
                                    new Position(x, y),
                                )
                            ) {
                                this.scene.actionManager.launchAction(
                                    new Position(x, y),
                                );
                            }
                        } else {
                            const tile = this.gameStore.game.plateau[x][y];
                            if (tile.entityId) {
                                this.scene.inspectCharacter(tile.entityId);
                            }
                        }
                        this.scene.rangeVisualizer.clearRange();
                        this.scene.actionManager.clearCurrentAction();
                    });
                    zone.on("pointerover", () => {
                        hoverGraphics.setVisible(true);
                        if (this.gameStore.game.plateau[x][y].entityId) {
                            const entity = this.gameStore.getEntity(
                                this.gameStore.game.plateau[x][y].entityId,
                            );

                            if (!this.scene.actionManager.currentAction) {
                                this.scene.tooltip.showNow(
                                    this.classStore.getClass(entity.classId)
                                        .name,
                                    `❤️ ${entity.stats.life} PV`,
                                    { x: zone.x, y: zone.y - 300 },
                                );
                            } 
                        }
                        if (this.scene.actionManager.currentAction) {
                            this.manageToolTip(x, y);
                        }
                    });
                    zone.on("pointerout", () => {
                        hoverGraphics.setVisible(false);
                        this.scene.tooltip.hide();
                        this.scene.rangeVisualizer.clearZonePreview();
                    });

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (tile as any).zone = zone;
                }
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

    manageToolTip(x?: number, y?: number) {
        const action = this.scene.actionManager.currentAction;
        if (!action) return;

        const zoneCells = this.scene.rangeVisualizer.spellZonePreview(action, new Position(x, y));
        if (!zoneCells || action.id === "walk") return;

        // ✅ collecte tous les tooltips à afficher
        const tooltipItems: { text: string; title?: string; position: { x: number; y: number } }[] = [];

        zoneCells.forEach((cell) => {
            const entityId = this.gameStore.game.plateau[cell.gridPosition.x][cell.gridPosition.y].entityId;
            if (!entityId) return;

            const targetEntity = this.gameStore.getEntity(entityId);
            if (!targetEntity) return;

            const damagePreview = this.scene.actionManager
                .calculateDamagePreview(action, this.playerStore.playerEntity, targetEntity)
                .join(" - ");

            tooltipItems.push({
                text: `${(action.damage?.max ?? 0) <= 0 ? "🩹" : "⚔️"} ${damagePreview}`,
                title: this.classStore.getClass(targetEntity.classId).name,
                position: { x: cell.pixelPosition.x, y: cell.pixelPosition.y - 300 },
            });
        });

        this.scene.tooltip.showFightingTooltip(tooltipItems);
    }

    async animate(): Promise<this> {
        return this;
    }
}

