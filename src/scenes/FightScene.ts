import { Character } from "../Model/Character";
import { PlayableCharacter } from "../Model/PlayableCharacter";
import { Position, PositionUtils } from "../Model/Position";
import { GameObject } from "../Model/GameObject";
import { SceneConfig } from "../data/SceneConfig";
import { Displayable, GameScene, SceneRenderConfig } from "../Model/GameScene";
import { CharacterClass } from "../Model/CharacterClass";
import { uiGrid } from "../core/Utils";
import { CustomContainer } from "../core/UI/Container";
import { Color } from "../data/ColorConfig";

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
    private sceneGrid = uiGrid(0, 0);

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

    init(data: { spawnPos: Position; class: CharacterClass; id: string }) {
        this.myPlayer = new PlayableCharacter(
            {
                position: data.spawnPos,
                id: data.id,
                spriteKey: data.class.spriteKey,
                iconImageKey: data.class.iconImageKey,
                name: data.class.name,
                baseStats: data.class.stats,
                actionList: data.class.actionList,
                scene: this,
            },
            data.class,
        );
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
                this.load.image(
                    this.myPlayer!.iconImageKey,
                    `assets/${this.myPlayer!.iconImageKey}.png`,
                );

                object.actionList.forEach((action) => {
                    if (action.props.iconSpriteKey) {
                        this.load.image(
                            action.props.iconSpriteKey,
                            `assets/action/${action.props.iconSpriteKey}.png`,
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

        const actionArea = this.sceneGrid.getArea(2, 8, 5, 1);
        const actionPanel = new CustomContainer(this, {
            title: "",
            x: actionArea.x + actionArea.width / 2,
            y: actionArea.y + actionArea.height / 2,
            width: actionArea.width,
            height: actionArea.height,
            borderWidth: 2,
            opacity: 0.5,
        });

        this.createCharacterStatsUi(this.myPlayer!);
    }

  createCharacterStatsUi(perso: Character) {
    // 1) Tu récupères la zone du panel dans la grille globale
    const statsArea = this.sceneGrid.getArea(0, 6, 2, 3);

    // 2) Tu crées le panel
    const statsPanel = new CustomContainer(this, {
        title: "",
        x: statsArea.x + statsArea.width / 2,
        y: statsArea.y + statsArea.height / 2,
        width: statsArea.width,
        height: statsArea.height,
        borderWidth: 6,
        opacity: 0.5,
    });

    // 3) Tu crées une grille *interne* au panel
    const statsGrid = uiGrid(
        0,
        0,
        statsPanel.width,
        statsPanel.height
    );

    const imgArea = statsGrid.getArea(0, 0, 3, 4);

    const statsImage = new CustomContainer(this, {
        title: "",
        x: statsPanel.x - statsPanel.width / 2 + imgArea.centerX,
        y: statsPanel.y - statsPanel.height / 2 + imgArea.centerY,
        width: imgArea.width,
        height: imgArea.height,
        borderWidth: 7,
        backgroundImage: perso.iconImageKey,
    });

    const classNameArea = statsGrid.getArea(3,0,6,1);

    const statsClassName = new CustomContainer(this, {
        title: this.myPlayer!.characterClass.name,
        x: statsPanel.x - statsPanel.width / 2 + classNameArea.centerX,
        y: statsPanel.y - statsPanel.height / 2 + classNameArea.centerY,
        width: classNameArea.width,
        height: classNameArea.height,
        borderWidth: 2,
        bgColor: Color.containerBorder,
        fontsize: 18
    });

    const playerNameArea = statsGrid.getArea(0,4,3,1);

    const statsName = new CustomContainer(this, {
        title: this.myPlayer!.name,
        x: statsPanel.x - statsPanel.width / 2 + playerNameArea.centerX,
        y: statsPanel.y - statsPanel.height / 2 + playerNameArea.centerY,
        width: playerNameArea.width,
        height: playerNameArea.height,
        borderWidth: 2,
        bgColor: Color.containerBorder,
        fontsize: 18
    });

}

}
