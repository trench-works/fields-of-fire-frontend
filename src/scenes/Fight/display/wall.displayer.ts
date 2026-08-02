import {
    Depth,
    DisplayRoot,
    GRID_LEVELS_OFFSET,
    GridArea,
    Position,
} from "../../../core";
import { FightScene } from "../fight.scene";
import { GameStore } from "../stores/game.store";
import { FightSceneDisplayer } from "./base/fight-scene.displayer";
import { DisplayImage } from "../../../core/UI/DisplayImage";
import { MiscAsset, MiscAssetId } from "../../../assets";
import { GridStore } from "../stores/grid.store";

export class WallDisplayer extends FightSceneDisplayer {
    protected root: DisplayRoot;

    constructor(
        scene: FightScene,
        gameStore: GameStore,
        private readonly gridStore: GridStore,
    ) {
        super(scene, gameStore);
        this.root = new DisplayRoot();
    }

    preRender(): this {
        return this;
    }

    render(): this {
        this.displayWalls();
        return this;
    }

    clean(): this {
        this.root.destroy();
        return this;
    }

    private displayWalls() {
        this.clean();
        for (let x = 0; x < this.gameStore.game.plateau.length; x++) {
            for (let y = 0; y < this.gameStore.game.plateau.length; y++) {
                const tile = this.gameStore.game.plateau[x][y];
                if (tile.isWall) {
                    this.addWall({ x, y });
                }
            }
        }
    }

    private addWall({ x, y }: Position) {
        const cell = this.gridStore.get({ x, y });
        if (cell) {
            this.root.add(
                new DisplayImage(
                    this.scene,
                    new GridArea(
                        cell.pixelPosition.x - 32 * this.scene.scaleFactor,
                        cell.pixelPosition.y -
                            32 * this.scene.scaleFactor -
                            16 * this.scene.scaleFactor,
                        64 * this.scene.scaleFactor,
                        64 * this.scene.scaleFactor,
                    ),
                )
                    .setImage(MiscAsset.getAssetKey(MiscAssetId.WALL))
                    .setDepth(
                        Depth.getFromGridPosition(
                            { x, y },
                            GRID_LEVELS_OFFSET.OBJECT,
                        ),
                    ),
            );
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

