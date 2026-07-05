import { MiscAsset, MiscAssetId } from "../../../../assets";
import { Depth, GRID_LEVELS_OFFSET, Position } from "../../../../core";
import { Diamond } from "../../../../core/Objects/Diamond";
import { scaleAndCenter } from "../../../../core/Utils/Scale";
import { PositionUtils } from "../../../../core/Utils/Sizing";
import { StatsUtils } from "../../../../Model/Stats";
import { FightScene } from "../../fight.scene";
import { ClassStore } from "../../stores/ClassStore";
import { GameStore } from "../../stores/GameStore";
import { GroundStore } from "../../stores/GroundStore";
import { PlayerStore } from "../../stores/PlayerStore";
import { FightSceneDisplayer } from "../FightSceneDisplayer";

export class GroundDisplayer extends FightSceneDisplayer {
    private tileHighlights: Phaser.GameObjects.Graphics[] = [];

    constructor(
        scene: FightScene,
        gameStore: GameStore,
        private readonly classStore: ClassStore,
        private readonly playerStore: PlayerStore,
        private readonly groundStore: GroundStore,
    ) {
        super(scene, gameStore);
    }

    preRender(): this {
        return this;
    }

    clean(): this {
        this.groundStore.groundLayer?.destroy();
        this.tileHighlights.forEach((highlight) => highlight.destroy());
        for (let x = 0; x < this.scene.gridPositions.length; x++) {
            for (let y = 0; y < this.scene.gridPositions[x].length; y++) {
                this.scene.gridPositions[x][y].highlight?.destroy();
                this.scene.gridPositions[x][y].hoverGraphics?.destroy();
                this.scene.gridPositions[x][y].zone?.destroy();
            }
        }
        return this;
    }

    render(): this {
        this.renderGroundLayer();
        this.generatePlayGrid();
        this.displayEntitiesHighlights();
        return this;
    }

    renderGroundLayer() {
        const map = this.scene.make.tilemap({
            key: this.scene.fightMap,
        });
        const tileset = map.addTilesetImage(
            MiscAssetId.GROUND,
            MiscAsset.getAssetKey(MiscAssetId.GROUND),
        );

        const centerMap = scaleAndCenter({
            parent: this.scene.scale,
            child: { width: map.widthInPixels, height: map.heightInPixels },
            isometricVariation: true,
        });

        if (!this.scene.renderConfig) {
            throw new Error("Render config not defined");
        }

        this.scene.renderConfig.offset = PositionUtils.add(
            this.scene.renderConfig.offset,
            { x: centerMap.offset.x, y: centerMap.offset.y },
        );
        this.scene.scaleFactor = centerMap.scaleFactor;

        const layer = map.createLayer(
            "Ground",
            tileset!,
            centerMap.offset.x,
            centerMap.offset.y,
        );
        console.log(layer);

        this.groundStore.setGroundLayer(layer);

        if (!this.groundStore.groundLayer) {
            throw new Error("Ground layer seemingly inexistent");
        }

        this.groundStore.groundLayer.setScale(this.scene.scaleFactor);
        this.groundStore.groundLayer.setDepth(Depth.GRID_BASE_OFFSET);
    }

    private displayEntitiesHighlights() {
        if (!this.groundStore.groundLayer) {
            this.renderGroundLayer();
        }
        for (const highlightEntity of this.tileHighlights) {
            highlightEntity.destroy();
        }
        this.tileHighlights = [];
        for (let x = 0; x < this.gameStore.game.plateau.length; x++) {
            for (let y = 0; y < this.gameStore.game.plateau.length; y++) {
                const caseTile = this.gameStore.game.plateau[x][y];
                // Ground part
                const tile = this.groundStore.groundLayer?.getTileAt?.(x, y);
                if (tile) {
                    tile.setVisible(true);
                    if (caseTile.isHole) {
                        tile.setVisible(false);
                    } else if (!caseTile.isWall) {
                        if (
                            caseTile.entityId &&
                            caseTile.entityId ===
                                this.gameStore.game.playerTurns[0]
                        ) {
                            const entity = this.gameStore.game.entities.find(
                                (entity) => entity.id === caseTile.entityId,
                            );
                            if (entity) {
                                this.tileHighlights.push(
                                    this.getTileHighlights({ x, y }, tile, {
                                        color:
                                            entity.teamId ===
                                            this.playerStore.playerEntity.teamId
                                                ? 0x00ff00
                                                : 0xff0000,
                                        depth: Math.max(x * 10, y * 10),
                                    }),
                                );
                            }
                        }
                    }
                }
            }
        }
    }

    private generatePlayGrid() {
        if (!this.groundStore.groundLayer) {
            return;
        }
        for (let x = 0; x < this.gameStore.game.plateau.length; x++) {
            if (!this.scene.gridPositions[x]) {
                this.scene.gridPositions[x] = [];
            }
            for (let y = 0; y < this.gameStore.game.plateau.length; y++) {
                const tile = this.groundStore.groundLayer.getTileAt(x, y);
                const caseTile = this.gameStore.game.plateau[x][y];

                const worldX = tile.getCenterX();
                const worldY = tile.getCenterY();

                this.scene.gridPositions[x][y] = {
                    gridPosition: { x, y },
                    pixelPosition: {
                        x: worldX,
                        y: worldY - 16 * this.scene.scaleFactor,
                    },
                };

                tile.setVisible(true);
                if (caseTile.isHole) {
                    tile.setVisible(false);
                } else if (!caseTile.isWall) {
                    if (!tile) continue;
                    const DIAMOND = new Diamond(tile, this.scene.scaleFactor);

                    const hoverGraphics = this.getTileHighlights(
                        { x, y },
                        tile,
                        {
                            color: 0xffffff,
                            DIAMOND,
                            depth: 2,
                        },
                    );
                    hoverGraphics.setVisible(false);
                    this.scene.gridPositions[x][y].hoverGraphics =
                        hoverGraphics;

                    const zone = this.getTileInteractiveZone({ x, y }, tile, {
                        DIAMOND,
                    });
                    this.scene.gridPositions[x][y].zone = zone;

                    // --- DEBUG VISUEL ---
                    //this.gridShower(DIAMOND, worldX, worldY, layer);
                    zone.on("pointerdown", () => {
                        this.scene.character.changeDirection({ x, y });
                        if (this.scene.actionManager.currentAction) {
                            if (
                                this.scene.rangeVisualizer.isInRange({ x, y })
                            ) {
                                this.scene.actionManager.launchAction({ x, y });
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
                                    `❤️ ${StatsUtils.fromEntity(entity).life} PV`,
                                    {
                                        x: zone.x,
                                        y:
                                            zone.y -
                                            140 * this.scene.scaleFactor,
                                    },
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
        position: Position,
        tile: Phaser.Tilemaps.Tile,
        props?: { color: number; DIAMOND?: Diamond; depth?: number },
    ): Phaser.GameObjects.Graphics {
        let DIAMOND: Diamond | undefined = props?.DIAMOND;
        if (!DIAMOND) {
            DIAMOND = new Diamond(tile, this.scene.scaleFactor);
        }
        const worldX = tile.getCenterX();
        const worldY = tile.getCenterY();

        // Create Graphic
        const graphics = this.scene.add.graphics();
        graphics.lineStyle(2, props?.color ?? 0xffffff, 1);
        graphics.strokePoints(DIAMOND.points, true);
        graphics.setPosition(worldX, worldY);
        graphics.setDepth(
            Depth.getFromGridPosition(
                position,
                GRID_LEVELS_OFFSET.HIGHTLIGHT_1,
            ),
        );

        return graphics;
    }

    getTileInteractiveZone(
        position: Position,
        tile: Phaser.Tilemaps.Tile,
        props?: { DIAMOND?: Diamond },
    ): Phaser.GameObjects.Zone {
        let DIAMOND: Diamond | undefined = props?.DIAMOND;
        if (!DIAMOND) {
            DIAMOND = new Diamond(tile, this.scene.scaleFactor);
        }
        const worldX = tile.getCenterX();
        const worldY = tile.getCenterY();

        // Create Zone
        const zone = this.scene.add.zone(worldX, worldY, 10, 10);
        zone.setInteractive(DIAMOND, Phaser.Geom.Polygon.Contains);
        zone.setDepth(
            Depth.getFromGridPosition(
                position,
                GRID_LEVELS_OFFSET.HIGHTLIGHT_2,
            ),
        );
        return zone;
    }

    update(): this {
        this.displayEntitiesHighlights();
        return this;
    }

    manageToolTip(x: number, y: number) {
        const action = this.scene.actionManager.currentAction;
        if (!action) return;

        const zoneCells = this.scene.rangeVisualizer.spellZonePreview(action, {
            x,
            y,
        });
        if (!zoneCells || action.id === "walk") return;

        // ✅ collecte tous les tooltips à afficher
        const tooltipItems: {
            text: string;
            title?: string;
            position: { x: number; y: number };
        }[] = [];

        zoneCells.forEach((cell) => {
            const entityId =
                this.gameStore.game.plateau[cell.gridPosition.x][
                    cell.gridPosition.y
                ].entityId;
            if (!entityId) return;

            const targetEntity = this.gameStore.getEntity(entityId);
            if (!targetEntity) return;

            const minDamage = this.scene.actionManager.calculateFinalDamage(
                action.damage?.min ?? 0,
                action,
                this.playerStore.playerEntity,
                targetEntity,
            );
            const maxDamage = this.scene.actionManager.calculateFinalDamage(
                action.damage?.max ?? 0,
                action,
                this.playerStore.playerEntity,
                targetEntity,
            );

            const isHeal = (action.damage?.max ?? 0) <= 0;

            tooltipItems.push({
                text: `${isHeal ? "🩹" : "⚔️"} ${isHeal ? -minDamage.defenserDamage : minDamage.defenserDamage}-${isHeal ? -maxDamage.defenserDamage : maxDamage.defenserDamage}`,
                title: this.classStore.getClass(targetEntity.classId).name,
                position: {
                    x: cell.pixelPosition.x,
                    y: cell.pixelPosition.y - 130 * this.scene.scaleFactor,
                },
            });
        });

        this.scene.tooltip.showFightingTooltip(tooltipItems);
    }

    async animate(): Promise<this> {
        return this;
    }
}

