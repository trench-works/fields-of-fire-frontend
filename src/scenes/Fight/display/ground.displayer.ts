import { MiscAsset, MiscAssetId } from "../../../assets";
import { Depth, GRID_LEVELS_OFFSET } from "../../../core";
import { Diamond } from "../../../core/Objects/Diamond";
import { Tile, TILE_SIZE, TileLayer } from "../../../core/UI/TileLayer";
import { scaleAndCenter } from "../../../core/Utils/Scale";
import { PositionUtils } from "../../../core/Utils/Sizing";
import { Entity } from "../../../Model/Entity";
import { TEAM_COLORS } from "../../../Model/Team";
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
            cell.destoy();
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

        if (this.gridStore.groundLayer){
            this.gridStore.groundLayer.clear();
        };

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
        this.scene.root.controllers.grid.clearHover();
        this.displayEntitiesHighlights();
        this.gridStore.forEach((tile) => {
            const caseTile = this.gameStore.getCell(tile.index);
            const { x, y } = tile.position;
            const diamond = new Diamond(tile, tile.scale);
            if (caseTile) {
                this.setZone(tile, !caseTile.isHole && !caseTile.isWall, {
                    diamond,
                });
            }
            //redimensionne hover graphics
            tile.hoverGraphics?.setVisible(false);
            tile.hoverGraphics?.clear();
            tile.hoverGraphics?.lineStyle(1.5 * tile.scale, 0xffffff, 1);
            tile.hoverGraphics?.strokePoints(diamond.points, true);
            tile.hoverGraphics?.setPosition(x, y);
            //redimensionne range highlight
            tile.rangeHighlight?.clear();
            tile.rangeHighlight?.fillStyle(0x00aaff, 0.6);
            tile.rangeHighlight?.fillPoints(diamond.points, true);
            tile.rangeHighlight?.setPosition(x, y);

            //destroy spell highlight
            tile.spellHighlight?.destroy();
        });
        return this;
    }

    private displayEntitiesHighlights() {
        if (!this.gridStore.groundLayer) {
            this.renderGroundLayer();
        }
        this.tileHighlights.forEach((highlightEntity) =>
            highlightEntity.destroy(),
        );
        this.teamColorHighlights.forEach((highlightEntity) =>
            highlightEntity.destroy(),
        );
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
                                this.setPlayerTurnHighlight(tile, entity);
                            }
                            this.setTileTeamColor(tile, entity);
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
                const diamond = new Diamond(tile, tile.scale);
                this.setZone(tile, !caseTile.isHole && !caseTile.isWall, {
                    diamond,
                });
                tile.setVisible(true);
                if (caseTile.isHole) {
                    tile.setVisible(false);
                } else if (!caseTile.isWall) {
                    this.setHoverGraphics(tile, {
                        diamond,
                    });
                }
            }
        });
    }

    setPlayerTurnHighlight(tile: Cell, entity: Entity) {
        this.tileHighlights.push(
            this.getTileHighlight(tile, {
                color:
                    entity.teamId === this.playerStore.playerEntity.teamId
                        ? 0x00ff00
                        : 0xff0000,
            }),
        );
    }

    setHoverGraphics(tile: Cell, props?: { diamond?: Diamond }) {
        const hoverGraphics = this.getTileHighlight(tile, {
            color: 0xffffff,
            diamond: props?.diamond,
        });
        hoverGraphics.setVisible(false);
        tile.hoverGraphics = hoverGraphics;
    }

    getTileHighlight(
        tile: Tile,
        props?: { color: number; diamond?: Diamond },
    ): Phaser.GameObjects.Graphics {
        let diamond: Diamond | undefined = props?.diamond;
        if (!diamond) {
            diamond = new Diamond(tile, tile.scale);
        }
        const { x, y } = tile.getPosition();

        // Create Graphic
        const graphics = this.scene.add.graphics();
        graphics.lineStyle(1.5 * tile.scale, props?.color ?? 0xffffff, 1);
        graphics.strokePoints(diamond.points, true);
        graphics.setPosition(x, y);
        graphics.setDepth(
            Depth.getFromGridPosition(
                tile.index,
                GRID_LEVELS_OFFSET.HIGHTLIGHT_1,
            ),
        );

        return graphics;
    }

    setTileTeamColor(tile: Cell, entity: Entity) {
        if (tile.teamColor) {
            tile.teamColor.destroy();
        }
        const { x, y } = tile.getPosition();

        const color = this.gameStore.getTeam(entity.teamId).color;

        // Create Graphic
        const graphics = this.scene.add.graphics();
        graphics.fillStyle(TEAM_COLORS[color], 0.5);
        graphics.fillEllipse(
            0,
            (-TILE_SIZE.height / 4) * tile.scale,
            (TILE_SIZE.width / 2) * tile.scale,
            (TILE_SIZE.height / 4) * tile.scale,
        );
        graphics.setPosition(x, y);
        graphics.setDepth(
            Depth.getFromGridPosition(
                tile.index,
                GRID_LEVELS_OFFSET.HIGHTLIGHT_1,
            ),
        );

        tile.teamColor = graphics;

        this.teamColorHighlights.push(graphics);
    }

    setZone(
        tile: Cell,
        interactive: boolean,
        props?: { diamond?: Diamond },
    ): void {
        if (tile.zone) {
            tile.zone.destroy();
        }
        let diamond: Diamond | undefined = props?.diamond;
        if (!diamond) {
            diamond = new Diamond(tile, tile.scale);
        }
        const { x, y } = tile.getPosition();

        // Create Zone
        const zone = this.scene.add.zone(x, y, 10, 10);
        zone.setInteractive(diamond, Phaser.Geom.Polygon.Contains);
        zone.setDepth(
            Depth.getFromGridPosition(
                tile.index,
                GRID_LEVELS_OFFSET.HIGHTLIGHT_2,
            ),
        );
        tile.zone = zone;
        zone.on("pointerdown", () => {
            this.gridStore.dragging = true;
            this.gridStore.dragOffset = PositionUtils.subtract(
                this.gridStore.mousePosition,
                tile.getPosition(),
            );
        });
        zone.on("pointerup", () => {
            if (interactive) {
                this.scene.root.controllers.grid.cellClick(tile.index);
            }
        });
        zone.on("pointerover", () => {
            this.gridStore.setHover(tile.index);
            if (interactive) {
                this.scene.root.controllers.grid.cellHover(tile.index);
            }
        });
        zone.on("pointerout", () => {
            this.gridStore.setHover(undefined);
            if (interactive) {
                this.scene.root.controllers.grid.cellHoverOut(tile.index);
            }
        });
    }

    update(): this {
        this.displayEntitiesHighlights();
        return this;
    }

    async animate(): Promise<this> {
        return this;
    }
}

