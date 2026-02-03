import { Scene } from "phaser";
import { Character } from "../Model/Character";
import { Utils } from "../core/Utils";
import { Position, PositionUtils } from "../Model/Position";
import { GameObject } from "../Model/GameObject";
import { SceneConfig } from "../data/SceneConfig";
import { Stats } from "../Model/Stats";

export type SceneRenderConfig = {
    tileSize: number;
    renderType: string;
    offset: Position;
};

export type RenderResult = {
    position: Position;
    sprite: string;
};

export interface Displayable {
    render(renderConfig: SceneRenderConfig): RenderResult | RenderResult[];
}

export class FightScene extends Scene implements Displayable {
    public backgroundImage = "red_bg";
    public fightMap = "chessmap";
    public tileSetImage = "damier";
    public tileWidth = 64;
    private gameObjects: GameObject[] = [];
    private displayObjects: Displayable[] = [];

    public renderConfig: SceneRenderConfig;

    constructor() {
        super({ key: "fightScene" });
        const config = new SceneConfig().loadConfig().getConfig("scene_1");
        if (!config) {
            throw new Error("Config doesnt exist");
        }
        this.renderConfig = {
            tileSize: config.render_config.tile_size,
            renderType: config.render_config.render_type,
            offset: new Position(),
        };

        this.renderConfig.offset = PositionUtils.getMapOffset(
            this.renderConfig,
        );

        const mainCharacter = new Character({
            position: new Position(
                config.player_spawn.x,
                config.player_spawn.y,
            ),
            sprite: "main_character_sprite",
            scene: this,
            id: "char1",
            name: "Hero",
            actionList: [],
            baseStats: new Stats(100, 10, 15, 80, 20, 50, 5),
        });

        this.gameObjects.push(mainCharacter);
    }

    preload() {
        this.load.tilemapTiledJSON(
            this.fightMap,
            `assets/${this.fightMap}.json`,
        );
        this.load.image("groundTiles", `assets/${this.tileSetImage}.png`);
        this.load.image(
            this.backgroundImage,
            `assets/${this.backgroundImage}.jpg`,
        );
    }

    create() {
        const bg = this.add
            .image(0, 0, this.backgroundImage)
            .setOrigin(0, 0)
            .setDepth(-1);
        bg.setDisplaySize(this.scale.width, this.scale.height);

        this.generateMap();
    }

    generateMap() {
        const map = this.make.tilemap({ key: this.fightMap });
        const tileset = map.addTilesetImage(this.tileSetImage, "groundTiles");

        const centerMap = Utils.scaleAndCenter({
            parentHeight: this.scale.height,
            parentWidth: this.scale.width,
            childHeight: map.heightInPixels,
            childWidth: map.widthInPixels,
            isometricVariation: true,
            scaleFactor: 1,
        });

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

        groundLayer.setScale(centerMap.scaleFactor);
        groundLayer.setDepth(0);
        this.gridShower(map, groundLayer);

        this.generatePlayGrid(map, groundLayer);
    }

    generatePlayGrid(
        map: Phaser.Tilemaps.Tilemap,
        layer: Phaser.Tilemaps.TilemapLayer,
    ) {
        const scale = layer.scaleX; // iso scaling

        for (let y = 0; y < map.height; y++) {
            for (let x = 0; x < map.width; x++) {
                const tile = layer.getTileAt(x, y);
                if (!tile) continue;

                const worldX = tile.getCenterX();
                const worldY = tile.getCenterY();

                const zone = this.add.zone(
                    worldX,
                    worldY,
                    tile.width * scale,
                    tile.height * scale,
                );

                const Y_OFFSET = 16 * scale;

                const diamond = new Phaser.Geom.Polygon([
                    0,
                    -(tile.height * scale) / 4 - Y_OFFSET,
                    (tile.width * scale) / 2,
                    -Y_OFFSET,
                    0,
                    (tile.height * scale) / 4 - Y_OFFSET,
                    -(tile.width * scale) / 2,
                    -Y_OFFSET,
                ]);

                zone.setInteractive(diamond, Phaser.Geom.Polygon.Contains);
                zone.setDepth(layer.depth + 3);

                // --- overlay graphique bleu ---
                const overlay = this.add.graphics();
                overlay.fillStyle(0x0000ff, 0.3); // bleu semi-transparent
                overlay.beginPath();
                overlay.moveTo(
                    worldX,
                    worldY - (tile.height * scale) / 4 - Y_OFFSET,
                );
                overlay.lineTo(
                    worldX + (tile.width * scale) / 2,
                    worldY - Y_OFFSET,
                );
                overlay.lineTo(
                    worldX,
                    worldY + (tile.height * scale) / 4 - Y_OFFSET,
                );
                overlay.lineTo(
                    worldX - (tile.width * scale) / 2,
                    worldY - Y_OFFSET,
                );
                overlay.closePath();
                overlay.fillPath();
                overlay.setDepth(layer.depth + 2); // juste sous la zone

                console.log(
                    `Tile [${tile.x},${tile.y}] center: (${tile.getCenterX()},${tile.getCenterY()})`,
                    `overlay center: (${diamond.x},${diamond.y})`,
                );

                // Stocker l’overlay pour pouvoir le modifier plus tard
                (tile as any).overlay = overlay;

                // clic
                zone.on("pointerdown", () => {
                    // Exemple : changer couleur overlay au clic
                    overlay.clear();
                    overlay.fillStyle(0x00ff00, 0.5);
                    overlay.beginPath();
                    overlay.moveTo(
                        worldX,
                        worldY - (tile.height * scale) / 4 - Y_OFFSET,
                    );
                    overlay.lineTo(
                        worldX + (tile.width * scale) / 2,
                        worldY - Y_OFFSET,
                    );
                    overlay.lineTo(
                        worldX,
                        worldY + (tile.height * scale) / 4 - Y_OFFSET,
                    );
                    overlay.lineTo(
                        worldX - (tile.width * scale) / 2,
                        worldY - Y_OFFSET,
                    );
                    overlay.closePath();
                    overlay.fillPath();

                    console.log(`Tile clicked: ${x}, ${y}`);
                });

                (tile as any).zone = zone;
            }
        }
    }

    render(): RenderResult[] {
        const result: RenderResult[] = [];
        for (const displayable of this.displayObjects) {
            const renderedElement = displayable.render(this.renderConfig);
            result.push(
                ...(Array.isArray(renderedElement)
                    ? renderedElement
                    : [renderedElement]),
            );
        }
        return result;
    }

    async recalculate(): Promise<void> {
        for (const gameObject of this.gameObjects) {
            await gameObject.recalculate();
        }
    }
    gridShower(
        map: Phaser.Tilemaps.Tilemap,
        layer: Phaser.Tilemaps.TilemapLayer,
    ) {
        const scale = layer.scaleX;
        const g = this.add.graphics();

        g.fillStyle(0x0000ff, 0.25);
        g.setDepth(layer.depth + 1);

        for (let y = 0; y < map.height; y++) {
            for (let x = 0; x < map.width; x++) {
                const tile = layer.getTileAt(x, y);
                if (!tile) continue;

                const cx = tile.getCenterX();
                const cy = tile.getCenterY();

                g.beginPath();
                const Y_OFFSET = 16 * scale;

                g.moveTo(cx, cy - (tile.height * scale) / 4 - Y_OFFSET);
                g.lineTo(cx + (tile.width * scale) / 2, cy - Y_OFFSET);
                g.lineTo(cx, cy + (tile.height * scale) / 4 - Y_OFFSET);
                g.lineTo(cx - (tile.width * scale) / 2, cy - Y_OFFSET);
                g.closePath();
                g.fillPath();
            }
        }
    }
}
