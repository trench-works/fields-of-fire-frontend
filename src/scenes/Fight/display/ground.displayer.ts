import { MiscAsset, MiscAssetId } from "../../../assets";
import { Depth, GRID_LEVELS_OFFSET, Position } from "../../../core";
import { Diamond } from "../../../core/Objects/Diamond";
import { scaleAndCenter } from "../../../core/Utils/Scale";
import { PositionUtils } from "../../../core/Utils/Sizing";
import { TEAM_COLORS, TeamColor } from "../../../Model/Team";
import { FightScene } from "../fight.scene";
import { GameStore } from "../stores/game.store";
import { GridStore } from "../stores/grid.store";
import { PlayerStore } from "../stores/player.store";
import { FightSceneDisplayer } from "./base/fight-scene.displayer";

export class GroundDisplayer extends FightSceneDisplayer {
    private tileHighlights: Phaser.GameObjects.Graphics[] = [];
    private teamColorHighlights: Phaser.GameObjects.Graphics[] = [];

    constructor(
        scene: FightScene,
        gameStore: GameStore,
        private readonly playerStore: PlayerStore,
        private readonly gridStore: GridStore,
    ) {
        super(scene, gameStore);
    }

    preRender(): this {
        return this;
    }

    clean(): this {
        this.gridStore.groundLayer?.destroy();
        this.tileHighlights.forEach((highlight) => highlight.destroy());
        this.teamColorHighlights.forEach((highlight) => highlight.destroy());
        for (let x = 0; x < this.gridStore.gridPositions.length; x++) {
            for (let y = 0; y < this.gridStore.gridPositions[x].length; y++) {
                this.gridStore.gridPositions[x][y].highlight?.destroy();
                this.gridStore.gridPositions[x][y].hoverGraphics?.destroy();
                this.gridStore.gridPositions[x][y].zone?.destroy();
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
            data: [
                [1, 3, 1, 2, 1, 2, 1, 4, 3, 2],
                [2, 1, 2, 1, 3, 1, 2, 1, 2, 1],
                [1, 2, 1, 2, 2, 3, 1, 4, 1, 2],
                [2, 1, 2, 1, 4, 1, 2, 1, 2, 1],
                [4, 3, 1, 2, 1, 2, 1, 2, 3, 2],
                [4, 1, 2, 1, 2, 1, 2, 1, 2, 4],
                [1, 2, 1, 2, 1, 2, 1, 2, 4, 2],
                [2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
                [1, 2, 1, 2, 2, 2, 1, 3, 1, 2],
                [2, 3, 3, 1, 2, 1, 2, 1, 4, 1],
            ],
            height: 10,
            width: 10,
            tileWidth: 64,
            tileHeight: 64,
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

        this.gridStore.setGroundLayer(layer);

        if (!this.gridStore.groundLayer) {
            throw new Error("Ground layer seemingly inexistent");
        }

        this.gridStore.groundLayer.setScale(this.scene.scaleFactor);
        this.gridStore.groundLayer.setDepth(Depth.GRID_BASE_OFFSET);
    }

    private displayEntitiesHighlights() {
        if (!this.gridStore.groundLayer) {
            this.renderGroundLayer();
        }
        for (const highlightEntity of this.tileHighlights) {
            highlightEntity.destroy();
        }
        for (const highlightEntity of this.teamColorHighlights) {
            highlightEntity.destroy();
        }
        this.tileHighlights = [];
        this.teamColorHighlights = [];
        console.log(this.gameStore.game.plateau);
        for (let x = 0; x < this.gameStore.game.plateau.length; x++) {
            for (let y = 0; y < this.gameStore.game.plateau.length; y++) {
                const caseTile = this.gameStore.game.plateau[x][y];
                // Ground part
                const tile = this.gridStore.groundLayer?.getTileAt?.(x, y);
                if (tile) {
                    tile.setVisible(true);
                    if (caseTile.isHole) {
                        tile.setVisible(false);
                    } else if (!caseTile.isWall) {
                        if (caseTile.entityId) {
                            const entity = this.gameStore.getEntity(
                                caseTile.entityId,
                            );
                            if (entity) {
                                if (
                                    caseTile.entityId ===
                                    this.gameStore.game.playerTurns[0]
                                ) {
                                    this.tileHighlights.push(
                                        this.getTileHighlights({ x, y }, tile, {
                                            color:
                                                entity.teamId ===
                                                this.playerStore.playerEntity
                                                    .teamId
                                                    ? 0x00ff00
                                                    : 0xff0000,
                                            depth: Math.max(x * 10, y * 10),
                                        }),
                                    );
                                }
                                this.teamColorHighlights.push(
                                    this.getTileTeamColor({ x, y }, tile, {
                                        color: this.gameStore.getTeam(
                                            entity.teamId,
                                        ).color,
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
        if (!this.gridStore.groundLayer) {
            return;
        }
        for (let x = 0; x < this.gameStore.game.plateau.length; x++) {
            if (!this.gridStore.gridPositions[x]) {
                this.gridStore.gridPositions[x] = [];
            }
            for (let y = 0; y < this.gameStore.game.plateau.length; y++) {
                const tile = this.gridStore.groundLayer.getTileAt(x, y);
                const caseTile = this.gameStore.game.plateau[x][y];

                const worldX = tile.getCenterX();
                const worldY = tile.getCenterY();

                this.gridStore.gridPositions[x][y] = {
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
                    this.gridStore.gridPositions[x][y].hoverGraphics =
                        hoverGraphics;

                    const zone = this.getTileInteractiveZone({ x, y }, tile, {
                        DIAMOND,
                    });
                    this.gridStore.gridPositions[x][y].zone = zone;

                    // --- DEBUG VISUEL ---
                    //this.gridShower(DIAMOND, worldX, worldY, layer);
                    zone.on("pointerdown", () =>
                        this.scene.root.controllers.grid.cellClick({ x, y }),
                    );
                    zone.on("pointerover", () =>
                        this.scene.root.controllers.grid.cellHover({ x, y }),
                    );
                    zone.on("pointerout", () =>
                        this.scene.root.controllers.grid.cellHoverOut({ x, y }),
                    );

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

    getTileTeamColor(
        position: Position,
        tile: Phaser.Tilemaps.Tile,
        props: { color: TeamColor; depth?: number },
    ): Phaser.GameObjects.Graphics {
        const tileX = tile.getCenterX();
        const tileY = tile.getCenterY();

        // Create Graphic
        const graphics = this.scene.add.graphics();
        graphics.fillStyle(TEAM_COLORS[props.color], 0.5);
        graphics.fillEllipse(
            0,
            -16 * this.scene.scaleFactor,
            32 * this.scene.scaleFactor,
            16 * this.scene.scaleFactor,
        );
        graphics.setPosition(tileX, tileY);
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

    async animate(): Promise<this> {
        return this;
    }
}

