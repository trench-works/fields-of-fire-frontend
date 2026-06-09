import { MiscAsset, MiscAssetId } from "../../../../assets";
import { scaleAndCenter } from "../../../../core/Utils/Scale";
import { PositionUtils } from "../../../../core/Utils/Sizing";
import { FightScene } from "../../fight.scene";
import { GameStore } from "../../stores/GameStore";
import { FightSceneDisplayer } from "../FightSceneDisplayer";

export class WallDisplayer extends FightSceneDisplayer {
    private wallLayer: Phaser.Tilemaps.TilemapLayer | null = null;

    constructor(scene: FightScene, gameStore: GameStore) {
        super(scene, gameStore);
    }

    preRender(): this {
        return this;
    }

    render(): this {
        const map = this.scene.make.tilemap({
            key: this.scene.fightMap,
        });
        const tileset = map.addTilesetImage(
            MiscAssetId.WALL,
            MiscAsset.getAssetKey(MiscAssetId.WALL),
        );

        const centerMap = scaleAndCenter({
            parent: this.scene.scale,
            child: { height: map.heightInPixels, width: map.widthInPixels },
            isometricVariation: true,
        });

        if (!this.scene.renderConfig) {
            throw new Error("Render config not defined");
        }

        this.scene.renderConfig.offset = PositionUtils.add(
            this.scene.renderConfig.offset,
            { x: centerMap.offset.x, y: centerMap.offset.y },
        );
        this.scene.scaleFactor = centerMap.scaleFactor;

        this.wallLayer = map.createLayer(
            "Wall",
            tileset!,
            centerMap.offset.x,
            centerMap.offset.y - 32 * this.scene.scaleFactor,
        );

        if (!this.wallLayer) {
            throw new Error("Wall layer seemingly inexistent");
        }

        this.wallLayer.setScale(this.scene.scaleFactor);
        this.wallLayer.setDepth(1);

        this.displayTiles();
        return this;
    }

    private displayTiles() {
        if (!this.wallLayer) {
            return;
        }
        for (let x = 0; x < this.gameStore.game.plateau.length; x++) {
            for (let y = 0; y < this.gameStore.game.plateau.length; y++) {
                const caseTile = this.gameStore.game.plateau[x][y];

                // Wall part
                const wallTile = this.wallLayer.getTileAt(x, y);
                if (wallTile) {
                    if (caseTile.isWall) {
                        //changer la depth de la wallTile
                    } else {
                        wallTile.setVisible(false);
                    }
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

