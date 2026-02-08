import { Character } from "../Model/Character";
import { Mob } from "../Model/Mob";
import { Position, PositionUtils } from "../Model/Position";
import { GameObject } from "../Model/GameObject";
import { SceneConfig } from "../data/SceneConfig";
import { Stats } from "../Model/Stats";
import { Displayable, GameScene, SceneRenderConfig } from "../Model/GameScene";

export class FightScene extends GameScene implements Displayable {
    public backgroundImage = "red_bg";
    public fightMap = "chessmap";
    public tileSetImage = "damier";
    public tileWidth = 64;
    public gameObjects: GameObject[] = [];
    public displayObjects: Displayable[] = [];
    public characters: Character[] ;
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
            sprite: "target2",
            scene: this,
            id: "char1",
            name: "Hero",
            actionList: [],
            baseStats: new Stats(100, 10, 15, 80, 20, 50, 5),
        });

        const secondaryCharacter = new Character({
            position: new Position(
                7,
                7,
            ),
            sprite: "entente_fantassin",
            scene: this,
            id: "char1",
            name: "Hero",
            actionList: [],
            baseStats: new Stats(100, 10, 15, 80, 20, 50, 5),
        });

        const tertioCharacter = new Character({
            position: new Position(
                1,
                7,
            ),
            sprite: "target",
            scene: this,
            id: "char1",
            name: "Hero",
            actionList: [],
            baseStats: new Stats(100, 10, 15, 80, 20, 50, 5),
        });

        this.gameObjects.push(mainCharacter);
        this.gameObjects.push(secondaryCharacter);
        this.gameObjects.push(tertioCharacter);

        this.characters = this.gameObjects.filter(
            (obj) => obj instanceof Character,
        );
        console.log("obj : " + this.gameObjects + " char : " + this.characters)
    }

    preload() {
        this.load.tilemapTiledJSON(
            this.fightMap,
            `assets/${this.fightMap}.json`,
        );
        this.load.image("groundTiles", `assets/${this.tileSetImage}.png`);

        //précharge les image des persos de la scène
        this.characters.forEach((object) => {
            if(object.sprite){
                this.load.image(object.sprite, `assets/Sprites/${object.sprite}.png` )
            }
            }
        )
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
        this.spawnEntities();
    }

}
