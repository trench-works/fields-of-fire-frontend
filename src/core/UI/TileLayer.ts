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
    public scale: number;
    public position: Position;

    private image: DisplayImage | null;

    constructor(
        private readonly scene: BaseScene,
        public readonly index: Position,
        offset: Position,
        { asset, scale }: TileProps,
    ) {
        this.asset = asset;
        this.scale = scale;
        this.image = null;
        const position = getTilePosition(this.index);
        this.position = PositionUtils.add(
            PositionUtils.multiply(position, this.scale),
            offset,
            {
                x: (-TILE_SIZE.width / 2) * this.scale,
                y: (-TILE_SIZE.height / 2) * this.scale,
            },
        );
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

    setScale(scale: number, zoom: number, offset: Position): this {
        this.scale = scale * zoom;
        const position = getTilePosition(this.index);
        this.position = PositionUtils.add(
            PositionUtils.multiply(position, this.scale),
            offset,
            {
                x: (-TILE_SIZE.width / 2) * this.scale,
                y: (-TILE_SIZE.height / 2) * this.scale,
            },
        );
        this.image?.place(
            new GridArea(
                this.position.x - this.width / 2,
                this.position.y - this.height / 2,
                this.width,
                this.height,
            ),
        );
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

    zoom: number = 1;

    width: number;
    height: number;

    constructor(
        scene: BaseScene,
        { width, height, asset, scale }: TileLayerConfig,
        constructor: Instantiable<T>,
    ) {
        this.width = width;
        this.height = height;
        const offset = {
            x: window.innerWidth / 2,
            y:
                window.innerHeight / 2 -
                (this.height * TILE_SIZE.height * scale * this.zoom) / 4,
        };
        this.tiles = [];
        for (let x = 0; x < width; x++) {
            const line: T[] = [];
            for (let y = 0; y < height; y++) {
                line.push(
                    new constructor(scene, { x, y }, offset, {
                        asset,
                        scale,
                    }).display(),
                );
            }
            this.tiles.push(line);
        }
    }

    getTile({ x, y }: Position): T | undefined {
        return this.tiles[x]?.[y];
    }

    zoomIn(scale: number) {
        this.zoom = Math.min(2, this.zoom + 0.1);
        this.scale(scale, this.zoom);
    }

    zoomOut(scale: number) {
        this.zoom = Math.max(0.1, this.zoom - 0.1);
        this.scale(scale, this.zoom);
    }

    scale(scale: number, zoom: number) {
        const offset = {
            x: window.innerWidth / 2,
            y:
                window.innerHeight / 2 -
                (this.height * TILE_SIZE.height * scale * zoom) / 4,
        };
        this.tiles.flat().forEach((tile) => tile.setScale(scale, zoom, offset));
    }
}

function getTilePosition(index: Position): Position {
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

