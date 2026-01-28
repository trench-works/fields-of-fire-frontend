import { Scene } from 'phaser';
import { Character } from "../Model/Character";
import { Utils } from '../core/Utils';
import { Position, PositionUtils } from '../Model/Position';
import { GameObject } from '../Model/GameObject';
import { SceneConfig } from '../data/SceneConfig';
import { Stats } from '../Model/Stats';

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
            this.renderConfig
        );

        const mainCharacter = new Character({
            position: new Position(
                config.player_spawn.x,
                config.player_spawn.y
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
        this.load.tilemapTiledJSON(this.fightMap, `assets/${this.fightMap}.json`);
        this.load.image("groundTiles", `assets/${this.tileSetImage}.png`);
        this.load.image(this.backgroundImage, `assets/${this.backgroundImage}.jpg`);
    }

    create() {
        const bg = this.add.image(0, 0, this.backgroundImage).setOrigin(0, 0).setDepth(-1);
        bg.setDisplaySize(this.scale.width, this.scale.height);

        this.generateMap();
    }

    generateMap() {
        
        const map = this.make.tilemap({ key: this.fightMap });
        const tileset = map.addTilesetImage(this.tileSetImage, "groundTiles");

        const centerMap = Utils.scaleAndCenter({parentHeight: this.scale.height, parentWidth: this.scale.width, childHeight: map.heightInPixels, childWidth: map.widthInPixels , isometricVariation: true});
        
        this.renderConfig.offset.add(new Position(centerMap.offsetX, centerMap.offsetY));

        const groundLayer = map.createLayer("Ground", tileset!, centerMap.offsetX,centerMap.offsetY);

        groundLayer?.setScale(centerMap.scaleFactor);
        groundLayer?.setDepth(0);
    }

    render(): RenderResult[] {
        const result: RenderResult[] = [];
        for (const displayable of this.displayObjects) {
            const renderedElement = displayable.render(this.renderConfig);
            result.push(
                ...(Array.isArray(renderedElement)
                    ? renderedElement
                    : [renderedElement])
            );
        }
        return result;
    }
        
    async recalculate(): Promise<void> {
        for (const gameObject of this.gameObjects) {
            await gameObject.recalculate();
        }
    }
}