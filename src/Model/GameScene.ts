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

export type Cell = {
    gridPosition: Position;
    pixelPosition: Position;
    zone: Phaser.GameObjects.Zone;
};

export interface Displayable {
    render(renderConfig: SceneRenderConfig): RenderResult | RenderResult[];
}

export class GameScene extends Scene implements Displayable {
    public backgroundImage = "red_bg";
    public fightMap = "chessmap";
    public tileSetImage = "damier";
    public tileWidth = 64;
    public renderConfig: SceneRenderConfig | undefined;
    public displayObjects: Displayable[] = [];
    public gameObjects: GameObject[] = [];
    public characters: Character[] = [];
    public gridPositions: Cell[][] = [];
    public scaleFactor: number= 1;

    spawnEntities() {
        this.characters.forEach((entity) => {
            //this.spawnCharacter(entity);
            entity.spawn(this, this.scaleFactor, this.gridPositions);
        });
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

        this.scaleFactor = centerMap.scaleFactor

        groundLayer.setScale(this.scaleFactor);
        groundLayer.setDepth(0);

        this.generatePlayGrid(map, groundLayer);
    }

    generatePlayGrid(
        map: Phaser.Tilemaps.Tilemap,
        layer: Phaser.Tilemaps.TilemapLayer
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

                zone.setInteractive(diamond, Phaser.Geom.Polygon.Contains);
                zone.setDepth(layer.depth + 3);

                // --- DEBUG VISUEL ---
                this.gridShower(diamond, worldX, worldY, layer);

                if (!this.gridPositions[y]) { this.gridPositions[y] = []; } 

                this.gridPositions[y][x] = { gridPosition: new Position (x, y ), pixelPosition: new Position(worldX, worldY-Yof*this.scaleFactor), zone }; 

                zone.on("pointerdown", () => {
                    console.log(`Tile clicked: ${x}, ${y}`);
                });

                (tile as any).zone = zone;
            }
        }
    }

    render(): RenderResult[] {
        const result: RenderResult[] = [];
        for (const displayable of this.displayObjects) {
            const renderedElement = displayable.render(this.renderConfig!);
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

