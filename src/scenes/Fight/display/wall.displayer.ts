import { Depth, GRID_LEVELS_OFFSET, GridArea, Position } from "../../../core";
import { FightScene } from "../fight.scene";
import { GameStore } from "../stores/game.store";
import { FightSceneDisplayer } from "./base/fight-scene.displayer";
import { DisplayImage } from "../../../core/UI/DisplayImage";
import { MiscAsset, MiscAssetId } from "../../../assets";
import { GridStore } from "../stores/grid.store";
import { TILE_SIZE } from "../../../core/UI/TileLayer";

export class Wall {
    private image: DisplayImage;

    constructor(
        scene: FightScene,
        private readonly gridStore: GridStore,
        private readonly position: Position,
    ) {
        const cell = this.gridStore.get(position)!;
        this.image = new DisplayImage(
            scene,
            new GridArea(
                cell.position.x - cell.height / 2,
                cell.position.y - cell.height,
                TILE_SIZE.width * cell.scale,
                TILE_SIZE.height * cell.scale,
            ),
        )
            .setImage(MiscAsset.getAssetKey(MiscAssetId.WALL))
            .setDepth(
                Depth.getFromGridPosition(position, GRID_LEVELS_OFFSET.OBJECT),
            );
    }

    destroy() {
        this.image.destroy();
    }

    scale() {
        const cell = this.gridStore.get(this.position)!;
        this.image.place(
            new GridArea(
                cell.position.x - cell.height / 2,
                cell.position.y - cell.height,
                TILE_SIZE.width * cell.scale,
                TILE_SIZE.height * cell.scale,
            ),
        );
    }
}

export class WallDisplayer extends FightSceneDisplayer {
    protected walls: Wall[][];

    constructor(
        scene: FightScene,
        gameStore: GameStore,
        private readonly gridStore: GridStore,
    ) {
        super(scene, gameStore);
        this.walls = [];
    }

    scale(): this {
        this.walls.flat().forEach((wall) => wall.scale());
        return this;
    }

    preRender(): this {
        return this;
    }

    render(): this {
        this.displayWalls();
        return this;
    }

    clean(): this {
        this.walls.flat().forEach((wall) => wall.destroy());
        return this;
    }

    private displayWalls() {
        this.clean();
        for (let i = 0; i < this.gameStore.game.plateau.length; i++) {
            this.walls.push([]);
        }
        this.gameStore.game.plateau.flat().forEach((tile) => {
            if (tile.isWall) {
                this.addWall(tile.position);
            }
        });
    }

    private addWall({ x, y }: Position) {
        const cell = this.gridStore.get({ x, y });
        if (cell) {
            this.walls[x][y] = new Wall(this.scene, this.gridStore, { x, y });
        }
    }

    update(): this {
        this.displayWalls();
        return this;
    }

    async animate(): Promise<this> {
        return this;
    }
}

