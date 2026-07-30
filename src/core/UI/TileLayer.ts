import { BaseScene } from "../Objects";
import { Position, Size } from "../Types";
import { Depth, GRID_LEVELS_OFFSET, GridArea } from "../Utils";
import { ranIn } from "../Utils/Random";
import { PositionUtils } from "../Utils/Sizing";
import { DisplayImage } from "./DisplayImage";

const TILE_SIZE: Size = {
    width: 64,
    height: 64,
};

export class Tile {
    private depth: number;

    private image: DisplayImage | null;

    constructor(
        private readonly scene: BaseScene,
        private readonly index: Position,
        private readonly position: Position,
        private readonly asset: string,
        private scale: number,
    ) {
        this.depth = 0;
        this.image = null;
    }

    setDepth(depth: number): this {
        this.depth = depth;
        return this;
    }

    setScale(scale: number): this {
        this.scale = scale;
        return this;
    }

    display(): this {
        this.image = new DisplayImage(
            this.scene,
            new GridArea(
                this.position.x - (TILE_SIZE.width / 2) * this.scale,
                this.position.y - (TILE_SIZE.height / 2) * this.scale,
                TILE_SIZE.width * this.scale,
                TILE_SIZE.height * this.scale,
            ),
        )
            .setImage(this.asset, 1)
            .setDepth(
                Depth.getFromGridPosition(
                    this.index,
                    GRID_LEVELS_OFFSET.OBJECT,
                ),
            );
        return this;
    }
}

export type TileLayerConfig = {
    width: number;
    height: number;
    assets: string[];
    scale: number;
};

export class TileLayer {
    tiles: Tile[][];

    position: Position;

    constructor(
        scene: BaseScene,
        { width, height, assets, scale }: TileLayerConfig,
    ) {
        this.position = {
            x: (width * TILE_SIZE.width) / 2,
            y: (height * TILE_SIZE.height) / 2,
        };
        this.tiles = [];
        for (let x = 0; x < width; x++) {
            const line: Tile[] = [];
            for (let y = 0; y < height; y++) {
                line.push(
                    new Tile(
                        scene,
                        { x, y },
                        { x: 0, y: 0 },
                        ranIn(assets),
                        scale,
                    ),
                );
            }
            this.tiles.push([]);
        }
    }

    getTilePosition(index: Position): Position {
        let position: Position = {
            x: TILE_SIZE.width / 2,
            y: TILE_SIZE.height / 2,
        };

        // add x position
        position = PositionUtils.add(
            position,
            PositionUtils.multiply(
                { x: TILE_SIZE.width / 2, y: -(TILE_SIZE.height / 2) },
                index.x,
            ),
        );

        // add y position
        position = PositionUtils.add(
            position,
            PositionUtils.multiply(
                { x: TILE_SIZE.width / 2, y: TILE_SIZE.height / 2 },
                index.x,
            ),
        );

        return position;
    }
}

