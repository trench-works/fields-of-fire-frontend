import { BaseScene } from "../Objects";
import { Position, Size } from "../Types";
import { Instantiable } from "../Types/Instantiable";
import { Depth, GridArea } from "../Utils";
import { ranInt } from "../Utils/Random";
import { PositionUtils } from "../Utils/Sizing";
import { DisplayImage } from "./DisplayImage";

export const TILE_SIZE: Size = {
    width: 64,
    height: 64,
};

export type TileProps = {
    scale: number;
    asset: string;
};

export class Tile {
    private asset: string;
    private scale: number;

    private image: DisplayImage | null;

    constructor(
        private readonly scene: BaseScene,
        public readonly index: Position,
        public readonly position: Position,
        { asset, scale }: TileProps,
    ) {
        this.asset = asset;
        this.scale = scale;
        this.image = null;
    }

    get height() {
        return TILE_SIZE.height * this.scale;
    }

    get width() {
        return TILE_SIZE.width * this.scale;
    }

    getPosition(): Position {
        return this.position;
    }

    setScale(scale: number): this {
        this.scale = scale;
        return this;
    }

    display(): this {
        this.image = new DisplayImage(
            this.scene,
            new GridArea(
                this.position.x - this.width / 2,
                this.position.y - this.height / 2,
                this.width,
                this.height,
            ),
        )
            .setImage(this.asset, {
                frame: ranInt(
                    this.scene.textures.get(this.asset).frameTotal - 1,
                ),
            })
            .setDepth(Depth.GRID_BASE_OFFSET + (this.index.x + this.index.y));
        return this;
    }

    setVisible(visible: boolean): this {
        this.image?.setVisible(visible);
        return this;
    }
}

export type TileLayerConfig = {
    width: number;
    height: number;
    asset: string;
    scale: number;
};

export class TileLayer<T extends Tile> {
    tiles: T[][];

    position: Position;

    constructor(
        scene: BaseScene,
        { width, height, asset, scale }: TileLayerConfig,
        constructor: Instantiable<T>,
    ) {
        this.position = {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2 - (height * TILE_SIZE.height) / 2,
        };
        this.tiles = [];
        for (let x = 0; x < width; x++) {
            const line: T[] = [];
            for (let y = 0; y < height; y++) {
                const position = this.getTilePosition({ x, y });
                line.push(
                    new constructor(
                        scene,
                        { x, y },
                        PositionUtils.add(
                            PositionUtils.multiply(position, scale),
                            this.position,
                            {
                                x: (-TILE_SIZE.width / 2) * scale,
                                y: (-TILE_SIZE.height / 2) * scale,
                            },
                        ),
                        {
                            asset,
                            scale,
                        },
                    ).display(),
                );
            }
            this.tiles.push(line);
        }
    }

    getTile({ x, y }: Position): T | undefined {
        return this.tiles[x]?.[y];
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
                { x: TILE_SIZE.width / 2, y: TILE_SIZE.height / 4 },
                index.x,
            ),
        );

        // add y position
        position = PositionUtils.add(
            position,
            PositionUtils.multiply(
                { x: -(TILE_SIZE.width / 2), y: TILE_SIZE.height / 4 },
                index.y,
            ),
        );

        return position;
    }
}

