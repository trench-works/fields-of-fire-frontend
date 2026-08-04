import { MiscAsset, MiscAssetId } from "../../../assets";
import { Depth, GRID_LEVELS_OFFSET, Position } from "../../../core";
import { Diamond } from "../../../core/Objects/Diamond";
import { Tile, TILE_SIZE, TileLayer } from "../../../core/UI/TileLayer";
import { scaleAndCenter } from "../../../core/Utils/Scale";
import { TEAM_COLORS, TeamColor } from "../../../Model/Team";
import { Cell, FightScene } from "../fight.scene";
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
        this.tileHighlights.forEach((highlight) => highlight.destroy());
        this.teamColorHighlights.forEach((highlight) => highlight.destroy());
        this.gridStore.groundLayer?.tiles.flat().forEach((cell) => {
            cell.highlight?.destroy();
            cell.hoverGraphics?.destroy();
            cell.zone?.destroy();
        });
        return this;
    }

    render(): this {
        this.renderGroundLayer();
        this.generatePlayGrid();
        this.displayEntitiesHighlights();
        return this;
    }

    renderGroundLayer() {
        const size = this.gameStore.game.plateau.length;
        const centerMap = scaleAndCenter({
            parent: this.scene.scale,
            child: {
                width: size * TILE_SIZE.width,
                height: size * TILE_SIZE.height,
            },
            isometricVariation: true,
        });

        this.scene.scaleFactor = centerMap.scaleFactor * 2;

        this.gridStore.setGroundLayer(
            new TileLayer(
                this.scene,
                {
                    width: size,
                    height: size,
                    asset: MiscAsset.getAssetKey(MiscAssetId.GROUND),
                    scale: this.scene.scaleFactor,
                },
                Cell,
            ),
        );
    }

    scale(): this {
        this.displayEntitiesHighlights();
        this.gridStore.forEach((tile) => {
            const { x, y } = tile.position;
            const diamond = new Diamond(tile, tile.scale);
            tile.zone?.setPosition(x, y);
            tile.zone?.setInteractive(diamond, Phaser.Geom.Polygon.Contains);
            tile.hoverGraphics?.clear();
            tile.hoverGraphics?.lineStyle(1.5 * tile.scale, 0xffffff, 1);
            tile.hoverGraphics?.strokePoints(diamond.points, true);
            tile.hoverGraphics?.setPosition(x, y);
        });
        return this;
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
        this.gridStore.forEach((tile) => {
            const caseTile = this.gameStore.getCell(tile.index);
            if (caseTile && tile) {
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
                                    this.getTileHighlights(tile.index, tile, {
                                        color:
                                            entity.teamId ===
                                            this.playerStore.playerEntity.teamId
                                                ? 0x00ff00
                                                : 0xff0000,
                                    }),
                                );
                            }
                            this.teamColorHighlights.push(
                                this.getTileTeamColor(tile.index, tile, {
                                    color: this.gameStore.getTeam(entity.teamId)
                                        .color,
                                }),
                            );
                        }
                    }
                }
            }
        });
    }

    private generatePlayGrid() {
        if (!this.gridStore.groundLayer) {
            return;
        }
        this.gridStore.forEach((tile) => {
            const caseTile = this.gameStore.getCell(tile.index);
            if (caseTile && tile) {
                tile.setVisible(true);
                if (caseTile.isHole) {
                    tile.setVisible(false);
                } else if (!caseTile.isWall) {
                    const DIAMOND = new Diamond(tile, tile.scale);

                    const hoverGraphics = this.getTileHighlights(
                        tile.index,
                        tile,
                        {
                            color: 0xffffff,
                            DIAMOND,
                        },
                    );
                    hoverGraphics.setVisible(false);
                    tile.hoverGraphics = hoverGraphics;

                    const zone = this.getTileInteractiveZone(tile.index, tile, {
                        DIAMOND,
                    });
                    tile.zone = zone;

                    // --- DEBUG VISUEL ---
                    //this.gridShower(DIAMOND, worldX, worldY, layer);
                    zone.on("pointerdown", () =>
                        this.scene.root.controllers.grid.cellClick(tile.index),
                    );
                    zone.on("pointerover", () =>
                        this.scene.root.controllers.grid.cellHover(tile.index),
                    );
                    zone.on("pointerout", () =>
                        this.scene.root.controllers.grid.cellHoverOut(
                            tile.index,
                        ),
                    );
                }
            }
        });
    }

    getTileHighlights(
        position: Position,
        tile: Tile,
        props?: { color: number; DIAMOND?: Diamond },
    ): Phaser.GameObjects.Graphics {
        let DIAMOND: Diamond | undefined = props?.DIAMOND;
        if (!DIAMOND) {
            DIAMOND = new Diamond(tile, tile.scale);
        }
        const { x, y } = tile.getPosition();

        // Create Graphic
        const graphics = this.scene.add.graphics();
        graphics.lineStyle(1.5 * tile.scale, props?.color ?? 0xffffff, 1);
        graphics.strokePoints(DIAMOND.points, true);
        graphics.setPosition(x, y);
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
        tile: Tile,
        props: { color: TeamColor },
    ): Phaser.GameObjects.Graphics {
        const { x, y } = tile.getPosition();

        // Create Graphic
        const graphics = this.scene.add.graphics();
        graphics.fillStyle(TEAM_COLORS[props.color], 0.5);
        graphics.fillEllipse(
            0,
            (-TILE_SIZE.height / 4) * tile.scale,
            (TILE_SIZE.width / 2) * tile.scale,
            (TILE_SIZE.height / 4) * tile.scale,
        );
        graphics.setPosition(x, y);
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
        tile: Tile,
        props?: { DIAMOND?: Diamond },
    ): Phaser.GameObjects.Zone {
        let DIAMOND: Diamond | undefined = props?.DIAMOND;
        if (!DIAMOND) {
            DIAMOND = new Diamond(tile, tile.scale);
        }
        const { x, y } = tile.getPosition();

        // Create Zone
        const zone = this.scene.add.zone(x, y, 10, 10);
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

