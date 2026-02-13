import { Character } from "../Model/Character";
import { PlayableCharacter } from "../Model/PlayableCharacter";
import { Position, PositionUtils } from "../Model/Position";
import { GameObject } from "../Model/GameObject";
import { SceneConfig } from "../data/SceneConfig";
import { Displayable, GameScene, SceneRenderConfig } from "../Model/GameScene";
import { CharacterClass } from "../Model/CharacterClass";

export class FightScene extends GameScene implements Displayable {
    public backgroundImage = "red_bg";
    public fightMap = "chessmap";
    public tileSetImage = "damier";
    public tileWidth = 64;
    public gameObjects: GameObject[] = [];
    public displayObjects: Displayable[] = [];
    public characters: Character[];
    private otherPlayers: PlayableCharacter[] = [];
    public renderConfig: SceneRenderConfig;
    public myPlayer: PlayableCharacter | undefined;

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

        this.characters = this.gameObjects.filter(
            (obj) => obj instanceof Character,
        );
        this.otherPlayers = this.characters.filter(
            (char) => char.id !== "player_1",
        ) as PlayableCharacter[];
    }

    init(data: { spawnPos: Position, class : CharacterClass, id: string }) {
        this.myPlayer = new PlayableCharacter({
            position: data.spawnPos,
            id: data.id,
            spriteKey: data.class.spriteKey,
            name: data.class.name,
            baseStats: data.class.stats,
            actionList: data.class.actionList,
            scene: this,         
        }, data.class);
    }

    preload() {
        this.load.tilemapTiledJSON(
            this.fightMap,
            `assets/${this.fightMap}.json`,
        );
        this.load.image("groundTiles", `assets/${this.tileSetImage}.png`);

        this.characters.push(this.myPlayer!);
        //précharge les image des persos de la scène
        this.characters.forEach((object) => {
            if (object.spriteKey) {
                this.load.spritesheet(
                    object.spriteKey,
                    `assets/Sprites/${object.spriteKey}.png`,
                    { frameWidth: 96, frameHeight: 128 },
                );
                object.actionList.forEach((action) => {
                    if (action.props.iconSpriteKey) {
                        this.load.image(
                            action.props.iconSpriteKey,
                            `assets/Sprites/${action.props.iconSpriteKey}.png`,
                        );
                    }
                });
            }
        });
        this.load.image(
            this.backgroundImage,
            `assets/${this.backgroundImage}.jpg`,
        );
    }

    create() {
        const num = this.otherPlayers.length;
        this.myPlayer!.name = ` Player ${num + 1}`;

        const bg = this.add
            .image(0, 0, this.backgroundImage)
            .setOrigin(0, 0)
            .setDepth(-1);
        bg.setDisplaySize(this.scale.width, this.scale.height);

        this.generateMap();
        this.spawnEntities();
    }
}
