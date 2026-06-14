import { DisplayRoot, GridArea } from "../../../../core";
import { FightScene } from "../../fight.scene";
import { GameStore } from "../../stores/GameStore";
import { FightSceneDisplayer } from "../FightSceneDisplayer";
import { DisplayImage } from "../../../../core/UI/Image";
import { MiscAsset, MiscAssetId } from "../../../../assets";

export class WallDisplayer extends FightSceneDisplayer {
    protected root: DisplayRoot;

    constructor(scene: FightScene, gameStore: GameStore) {
        super(scene, gameStore);
        this.root = new DisplayRoot();
    }

    preRender(): this {
        return this;
    }

    render(): this {
        this.displayTiles();
        return this;
    }

    private displayTiles() {
        for (let x = 0; x < this.gameStore.game.plateau.length; x++) {
            for (let y = 0; y < this.gameStore.game.plateau.length; y++) {
                const tile = this.gameStore.game.plateau[x][y];
                if (tile.isWall) {
                    const cell = this.scene.gridPositions[x][y];
                    this.root.add(
                        new DisplayImage(
                            this.scene,
                            new GridArea(
                                cell.pixelPosition.x -
                                    32 * this.scene.scaleFactor,
                                cell.pixelPosition.y -
                                    32 * this.scene.scaleFactor,
                                64 * this.scene.scaleFactor,
                                64 * this.scene.scaleFactor,
                            ),
                        ).setImage(MiscAsset.getAssetKey(MiscAssetId.WALL), 1),
                    );
                }
            }
        }
    }

    update(): this {
        this.displayTiles();
        return this;
    }

    async animate(): Promise<this> {
        return this;
    }
}

