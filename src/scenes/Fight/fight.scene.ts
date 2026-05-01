import { Character } from "./objects/Character";
import { PlayableCharacter } from "../../Model/PlayableCharacter";
import {
    GameScene,
    SceneRenderConfig,
    DataDisplayer,
    CustomContainer,
    GridUtils,
    Position,
    PositionUtils,
} from "../../core";
import { CharacterClass } from "../../Model/CharacterClass";
import { SceneConfig } from "../../config/SceneConfig";
import { Color } from "../../config/ColorConfig";
import { ActionAsset } from "../../assets";
import { RangeVisualizer } from "./objects/RangeVisualizer";
import { GamePlayerSocket } from "./repositories/player.repository";
import { ActionManager } from "./objects/ActionManager";
import { Tooltip } from "../../core/UI/Tooltip";

export class FightScene extends GameScene {
    public backgroundImage = "red_bg";
    public fightMap = "chessmap";
    public tileSetImage = "damier";
    public tileWidth = 64;
    public renderConfig: SceneRenderConfig;
    private sceneGrid = GridUtils.uiGrid(0, 0);
    private allExistingStats: string[] = [
        "life",
        "initiative",
        "strength",
        "precision",
        "accuracy",
        "dodging",
        "energy",
        "mouvement",
    ];
    public playerSocket!: GamePlayerSocket;
    public actionManager: ActionManager = new ActionManager(this);
    public rangeVisualizer: RangeVisualizer = new RangeVisualizer(this);
    public tooltip! : Tooltip; 

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

        this.allExistingStats.forEach((stat) =>
            this.load.image(stat, `assets/icon/icon_${stat}.png`),
        );

        this.characters.push(this.myPlayer!);
        ActionAsset.loadAll(this.load);
        //précharge les image des persos de la scène
        this.characters.forEach((object) => {
            if (object.spriteKey) {
                this.load.spritesheet(
                    object.spriteKey,
                    `assets/Sprites/${object.spriteKey}.png`,
                    { frameWidth: 96, frameHeight: 128 }
                );
                this.load.image(
                    this.myPlayer!.iconImageKey,
                    `assets/${this.myPlayer!.iconImageKey}.png`
                );
            }
        });

        this.load.image(
            this.backgroundImage,
            `assets/${this.backgroundImage}.jpg`,
        );
    }

    create() {
        this.playerSocket = new GamePlayerSocket("3630", this.myPlayer.id);

        this.tooltip = Tooltip.getInstance(this, {
            textColor: "#000000",
            fontSize: 14,
            delay: 750,
        });

        const num = this.otherPlayers.length;
        this.myPlayer.name = ` Player ${num + 1}`;

        const bg = this.add
            .image(0, 0, this.backgroundImage)
            .setOrigin(0, 0)
            .setDepth(-1);
        bg.setDisplaySize(this.scale.width, this.scale.height);

        this.generateMap(this.actionManager, this.rangeVisualizer);
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

        const actionGrid = GridUtils.uiGrid(
            0,
            0,
            actionPanel.width,
            actionPanel.height,
        );
        const actionListArea = actionGrid.getArea(0, 1, 9, 7);

        const statsTable = new DataDisplayer(this, {
            position: new Position(
                actionPanel.x - actionPanel.width / 2 + actionListArea.centerX,
                actionPanel.y - actionPanel.height / 2 + actionListArea.centerY,
            ),
            width: actionListArea.width,
            height: actionListArea.height,
            cols: 9,
            rows: 1,
        });

        // --- Placement des icônes ---
        this.myPlayer.actionList.forEach((action, index) => {
            const rangeManager: number | undefined =
                action.props.id === "walk"
                    ? this.myPlayer.baseStats.mouvement
                    : action.props.range;

            const iconObj = statsTable.placeContent(
                index,
                0,
                {
                    icon: action.props.iconSpriteKey,
                    onClick: () => {
                        this.rangeVisualizer.onActionSelected(
                            this.myPlayer!.position,
                            rangeManager,
                        );
                        this.actionManager.currentAction = action;
                    },
                },
                64,
            );
            if (iconObj) {
            iconObj.setInteractive();
            this.tooltip.attachTo(iconObj, action.props.name ?? action.props.id);
        }
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
        const statsGrid = GridUtils.uiGrid(
            0,
            0,
            statsPanel.width,
            statsPanel.height,
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

        const classNameArea = statsGrid.getArea(3, 0, 6, 1);

        const statsClassName = new CustomContainer(this, {
            title: this.myPlayer!.characterClass.name,
            x: statsPanel.x - statsPanel.width / 2 + classNameArea.centerX,
            y: statsPanel.y - statsPanel.height / 2 + classNameArea.centerY,
            width: classNameArea.width,
            height: classNameArea.height,
            borderWidth: 2,
            bgColor: Color.containerBorder,
            fontsize: 18,
        });
        const playerNameArea = statsGrid.getArea(0, 4, 3, 1);

        const statsName = new CustomContainer(this, {
            title: this.myPlayer!.name,
            x: statsPanel.x - statsPanel.width / 2 + playerNameArea.centerX,
            y: statsPanel.y - statsPanel.height / 2 + playerNameArea.centerY,
            width: playerNameArea.width,
            height: playerNameArea.height,
            borderWidth: 2,
            bgColor: Color.containerBorder,
            fontsize: 18,
        });

        const statValuesArea = statsGrid.getArea(3, 1, 6, 8);

        const statsTable = new DataDisplayer(this, {
            position: new Position(
                statsPanel.x - statsPanel.width / 2 + statValuesArea.centerX,
                statsPanel.y - statsPanel.height / 2 + statValuesArea.centerY,
            ),
            width: statValuesArea.width,
            height: statValuesArea.height,
            cols: 4,
            rows: 4,
        });

        // --- Placement des icônes ---
        this.allExistingStats.forEach((icon, index) => {
            const row = Math.floor(index / 2);
            const col = (index % 2) * 2;

            const iconObj = statsTable.placeContent(col, row, { icon });

            if (iconObj) {
                iconObj.setInteractive();
                this.tooltip.attachTo(iconObj, icon); // ex: "life", "strength" …
            }
        });

        statsTable.placeContent(1, 0, this.myPlayer!.baseStats.life);
        statsTable.placeContent(3, 0, this.myPlayer!.baseStats.initiative);
        statsTable.placeContent(1, 2, this.myPlayer!.baseStats.accuracy);

        statsTable.placeContent(3, 3, this.myPlayer!.baseStats.mouvement);
        statsTable.placeContent(3, 1, this.myPlayer!.baseStats.precision);

        statsTable.placeContent(1, 1, this.myPlayer!.baseStats.strength);

        statsTable.placeContent(1, 3, this.myPlayer!.baseStats.energy);
        statsTable.placeContent(3, 2, this.myPlayer!.baseStats.dodging);
    }
}
