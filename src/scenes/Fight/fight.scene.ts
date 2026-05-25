import { Character } from "./objects/Character";
import {
    GameScene,
    SceneRenderConfig,
    DataDisplayer,
    CustomContainer,
    GridUtils,
    Position,
    PositionUtils,
    MenuButton,
} from "../../core";
import { CharacterClass } from "../../Model/CharacterClass";
import { SceneConfig } from "../../config/SceneConfig";
import { Color } from "../../config/ColorConfig";
import { ActionAsset } from "../../assets";
import { RangeVisualizer } from "./objects/RangeVisualizer";
import { GamePlayerSocket } from "./repositories/player.socket";
import { ActionManager } from "./objects/ActionManager";
import { Tooltip } from "../../core/UI/Tooltip";
import { Game } from "../../Model/Game";
import { ClassesRepository } from "../Lobby/repositories/classes.repository";
import { MainMenu } from "../MainMenu/main-menu.scene";

export type FightSceneInit = {
    game: Game;
    player: { playerId: string };
};

export class FightScene extends GameScene {
    public backgroundImage = "red_bg";
    public fightMap = "chessmap";
    public tileSetImage = "ground";
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
    public tooltip!: Tooltip;
    private menuButton!: MenuButton;
    private gamePayload!: Game;
    private classes: CharacterClass[] = [];
    private inspectedStatsPanel: {
        statsPanel: CustomContainer;
        statsTable: DataDisplayer;
        statsImage: CustomContainer;
        statsClassName: CustomContainer;
        statsName: CustomContainer;
    } | null = null;

    constructor() {
        super({ key: "fightScene" });
        const config = new SceneConfig().loadConfig().getConfig("scene_1");
        if (!config) {
            throw new Error("Config doesnt exist");
        }

        new ClassesRepository().getClasses().then((data) => {
            this.classes = data;
        });
        this.renderConfig = {
            tileSize: config.render_config.tile_size,
            renderType: config.render_config.render_type,
            offset: new Position(),
        };
        this.renderConfig.offset = PositionUtils.getMapOffset(
            this.renderConfig,
        );
    }

    static start(scene: Phaser.Scene, data: FightSceneInit) {
        scene.scene.start("fightScene", data);
    }

    init({ game, player: { playerId } }: FightSceneInit) {
        this.playerSocket = new GamePlayerSocket(game.id, playerId);
        this.playerSocket.onClose(() => MainMenu.start(this));
        this.playerSocket.onUpdate((game: Game) => {
            this.displayEntitiesHighlights(game);
            const player = game.players.find(
                (player) => player.userId === global.user.id,
            )!;
            const entity = game.entities.find(
                (entity) => entity.entityId === player.entityId,
            )!;
            this.myPlayer.move(entity.position, this.gridPositions);
        });

        this.gamePayload = game;
        const player = game.players.find(
            (player) => player.playerId === playerId,
        )!;
        const playerEntity = game.entities.find(
            (entity) => entity.entityId === player.entityId,
        )!;
        const playerClass = this.classes.find(
            (charClass) => charClass.id === playerEntity.classId,
        )!;
        this.myPlayer = new Character({
            entity: playerEntity,
            character: playerClass,
            scene: this,
        });
        this.characters = game.entities
            .filter((entity) => entity.entityId !== playerEntity.entityId)
            .map((entity) => {
                const entityClass = this.classes.find(
                    (charClass) => charClass.id === entity.classId,
                )!;
                return new Character({
                    entity: entity,
                    character: entityClass,
                    scene: this,
                });
            });
    }

    preload() {
        ActionAsset.loadAll(this.load);
        this.load.tilemapTiledJSON(
            this.fightMap,
            `assets/${this.fightMap}.json`,
        );
        this.load.image("groundTiles", `assets/${this.tileSetImage}.png`);

        this.allExistingStats.forEach((stat) =>
            this.load.image(stat, `assets/icon/icon_${stat}.png`),
        );

        this.characters.push(this.myPlayer);
        //précharge les image des persos de la scène
        this.characters.forEach((object) => object.preload(this.load));

        this.load.image(
            this.backgroundImage,
            `assets/${this.backgroundImage}.png`,
        );
    }

    create() {
        this.tooltip = Tooltip.getInstance(this, {
            textColor: "#000000",
            fontSize: 14,
            delay: 750,
        });

        const bg = this.add
            .image(0, 0, this.backgroundImage)
            .setOrigin(0, 0)
            .setDepth(-1);
        bg.setDisplaySize(this.scale.width, this.scale.height);

        this.generateMap(
            this.actionManager,
            this.rangeVisualizer,
            this.gamePayload,
        );
        this.spawnEntities();

        // Créer le bouton Menu
        this.menuButton = new MenuButton(this, {
            position: "topRight",
            onResumeClick: () => {
                // Reprendre le jeu (le menu se ferme automatiquement)
            },
            onSettingsClick: () => {
                console.log("Options - À implémenter");
            },
            onMainMenuClick: () => {
                this.scene.start("mainMenuScene");
            },
        });

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
                action.id === "walk"
                    ? this.myPlayer.baseStats.mouvement
                    : action.range;

            const iconObj = statsTable.placeContent(
                index,
                0,
                {
                    icon: ActionAsset.getAssetKey(action.id),
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
                this.tooltip.attachTo(iconObj, action.name ?? action.id);
            }
        });

        this.createCharacterStatsUi(this.myPlayer!, { x: 0, y: 6 });

        this.events.on("characterClicked", (perso: Character) => {
            this.inspectCharacter(perso);
        });
    }

    createCharacterStatsUi(
        perso: Character,
        gridPosition: { x: number; y: number },
    ) {
        // 1) Tu récupères la zone du panel dans la grille globale
        const statsArea = this.sceneGrid.getArea(
            gridPosition.x,
            gridPosition.y,
            2,
            3,
        );

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
            title: perso.name,
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
            title: perso.name,
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

        // first column
        statsTable.placeContent(1, 0, perso.baseStats.life);
        statsTable.placeContent(1, 1, perso.baseStats.strength);
        statsTable.placeContent(1, 2, perso.baseStats.accuracy);
        statsTable.placeContent(1, 3, perso.baseStats.energy);

        // second column
        statsTable.placeContent(3, 0, perso.baseStats.initiative);
        statsTable.placeContent(3, 1, perso.baseStats.precision);
        statsTable.placeContent(3, 2, perso.baseStats.dodging);
        statsTable.placeContent(3, 3, perso.baseStats.mouvement);

        return {
            statsPanel,
            statsTable,
            statsImage,
            statsClassName,
            statsName,
        };
    }

    public inspectCharacter(perso: Character) {
        // Détruire l'ancien panneau si existant
        if (this.inspectedStatsPanel) {
            this.inspectedStatsPanel.statsPanel.destroy();
            this.inspectedStatsPanel.statsTable.destroy();
            this.inspectedStatsPanel.statsImage.destroy();
            this.inspectedStatsPanel.statsClassName.destroy();
            this.inspectedStatsPanel.statsName.destroy();
            this.inspectedStatsPanel = null;
        }

        this.inspectedStatsPanel = this.createCharacterStatsUi(perso, {
            x: 7,
            y: 6,
        });
    }
}

