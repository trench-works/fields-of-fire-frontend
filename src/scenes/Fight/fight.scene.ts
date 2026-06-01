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
import { SceneConfig } from "../../config/SceneConfig";
import { Color } from "../../config/ColorConfig";
import { RangeVisualizer } from "./objects/RangeVisualizer";
import { GamePlayerSocket } from "./repositories/player.socket";
import { ActionManager } from "./objects/ActionManager";
import { Tooltip } from "../../core/UI/Tooltip";
import { Game } from "../../Model/Game";
import { ClassesRepository } from "../Lobby/repositories/classes.repository";
import { MainMenu } from "../MainMenu/main-menu.scene";
import { ActionDisplayer } from "./components/ActionDisplayer";
import { ActionAsset } from "../../assets";
import {
    BackgroundAsset,
    BackgroundAssetId,
} from "../../assets/BackgroundAsset";
import { ClassStore } from "./stores/ClassStore";
import { GameStore } from "./stores/GameStore";
import { PlayerStore } from "./stores/PlayerStore";

export type FightSceneInit = {
    game: Game;
    player: { playerId: string };
};

export class FightScene extends GameScene {
    /**
     * Stores
     */
    protected classStore: ClassStore;
    protected gameStore: GameStore;
    protected playerStore: PlayerStore;

    /**
     * Sockets
     */
    public playerSocket!: GamePlayerSocket;

    /**
     * Displayers
     */
    private actions!: ActionDisplayer;

    public renderConfig: SceneRenderConfig;
    public sceneGrid = GridUtils.uiGrid(0, 0);
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
    public actionManager: ActionManager = new ActionManager(this);
    public rangeVisualizer: RangeVisualizer = new RangeVisualizer(this);
    public tooltip!: Tooltip;
    private inspectedStatsPanel: {
        statsPanel: CustomContainer;
        statsTable: DataDisplayer;
        statsImage: CustomContainer;
        statsClassName: CustomContainer;
        statsName: CustomContainer;
    } | null = null;
    private charStatsDisplays: Phaser.GameObjects.GameObject[] = [];

    constructor() {
        super({ key: "fightScene" });

        /**
         * Stores
         */
        this.classStore = new ClassStore();
        this.gameStore = new GameStore();
        this.playerStore = new PlayerStore(this.classStore, this.gameStore);

        const config = new SceneConfig().loadConfig().getConfig("scene_1");
        if (!config) {
            throw new Error("Config doesnt exist");
        }

        new ClassesRepository()
            .getClasses()
            .then((data) => this.classStore.setClasses(data));

        this.renderConfig = {
            tileSize: config.render_config.tile_size,
            renderType: config.render_config.render_type,
            offset: new Position(),
        };
        this.renderConfig.offset = PositionUtils.getMapOffset(
            this.renderConfig,
        );
        this.actions = new ActionDisplayer(
            this,
            this.gameStore,
            this.playerStore,
        );
    }

    static start(scene: Phaser.Scene, data: FightSceneInit) {
        scene.scene.start("fightScene", data);
    }

    init({ game, player: { playerId } }: FightSceneInit) {
        this.gameStore.setGame(game);
        this.playerStore.setPlayerId(playerId);

        this.actions.preRender();

        this.playerSocket = new GamePlayerSocket(game.id, playerId);
        this.playerSocket.onClose(() => MainMenu.start(this));
        this.playerSocket.onUpdate((game: Game) => {
            /**
             * Update Store
             */
            this.gameStore.setGame(game);
            this.playerStore.update();

            /**
             * Update Displayers
             */
            this.loadGameData(game, playerId);
            this.displayEntitiesHighlights(game);
            this.displayCharacter();
            this.actions.update();
        });

        this.loadGameData(game, playerId);
    }

    loadGameData(game: Game, playerId: string) {
        this.gamePayload = game;
        const player = game.players.find(
            (player) => player.playerId === playerId,
        )!;
        const playerEntity = game.entities.find(
            (entity) => entity.entityId === player.entityId,
        )!;
        const playerClass = this.classStore.classes.find(
            (charClass) => charClass.id === playerEntity.classId,
        )!;
        this.myPlayer ??= new Character(this, {
            entity: playerEntity,
            charClass: playerClass,
        });
        this.myPlayer.entity = playerEntity;
        this.myPlayer.move(this.gridPositions);
        this.characters = game.entities
            .filter((entity) => entity.entityId !== playerEntity.entityId)
            .map((entity) => {
                const entityClass = this.classStore.classes.find(
                    (charClass) => charClass.id === entity.classId,
                )!;
                return new Character(this, {
                    entity: entity,
                    charClass: entityClass,
                });
            });
    }

    preload() {
        ActionAsset.loadAll(this.load);
        BackgroundAsset.load(this.load, BackgroundAssetId.FIGHT);

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
    }

    create() {
        this.tooltip = Tooltip.getInstance(this, {
            textColor: "#000000",
            fontSize: 14,
            delay: 750,
        });
        this.actions.render();

        const bg = this.add
            .image(0, 0, BackgroundAsset.getAssetKey(BackgroundAssetId.FIGHT))
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
        new MenuButton(this, {
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

        // --- Placement des icônes ---

        this.events.on("characterClicked", (perso: Character) => {
            this.inspectCharacter(perso);
        });

        this.turnDisplayer();
        this.displayEntitiesHighlights(this.gamePayload);
        this.displayCharacter();
    }

    createCharacterStatsUi(
        perso: Character,
        gridPosition: { x: number; y: number },
        name: string,
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
            backgroundImage: perso.charClass.iconImageKey,
        });

        const classNameArea = statsGrid.getArea(3, 0, 6, 1);

        const statsClassName = new CustomContainer(this, {
            title: perso.charClass.name,
            x: statsPanel.x - statsPanel.width / 2 + classNameArea.centerX,
            y: statsPanel.y - statsPanel.height / 2 + classNameArea.centerY,
            width: classNameArea.width,
            height: classNameArea.height,
            borderWidth: 2,
            bgColor: Color.containerBorder,
            fontSize: 18,
        });
        const playerNameArea = statsGrid.getArea(0, 4, 3, 1);

        const statsName = new CustomContainer(this, {
            title: name,
            x: statsPanel.x - statsPanel.width / 2 + playerNameArea.centerX,
            y: statsPanel.y - statsPanel.height / 2 + playerNameArea.centerY,
            width: playerNameArea.width,
            height: playerNameArea.height,
            borderWidth: 2,
            bgColor: Color.containerBorder,
            fontSize: 18,
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
        const stats = perso.stats;
        statsTable.placeContent(1, 0, stats.life);
        statsTable.placeContent(1, 1, stats.strength);
        statsTable.placeContent(1, 2, stats.accuracy);
        statsTable.placeContent(1, 3, stats.energy);

        // second column
        statsTable.placeContent(3, 0, stats.initiative);
        statsTable.placeContent(3, 1, stats.precision);
        statsTable.placeContent(3, 2, stats.dodging);
        statsTable.placeContent(3, 3, stats.mouvement);

        return {
            statsPanel,
            statsTable,
            statsImage,
            statsClassName,
            statsName,
        };
    }

    public displayCharacter() {
        for (const charDisplay of this.charStatsDisplays) {
            charDisplay.destroy();
        }
        const {
            statsPanel,
            statsTable,
            statsImage,
            statsClassName,
            statsName,
        } = this.createCharacterStatsUi(
            this.myPlayer,
            { x: 0, y: 6 },
            user.username,
        );
        this.charStatsDisplays = [
            statsPanel,
            statsTable,
            statsImage,
            statsClassName,
            statsName,
        ];
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

        this.inspectedStatsPanel = this.createCharacterStatsUi(
            perso,
            {
                x: 7,
                y: 6,
            },
            this.myPlayer.charClass.name.split(" ")[0],
        );
    }

    public turnDisplayer() {
        const turndisplay = this.sceneGrid.getArea(0, 0, 6, 2);
        const turnPanel = new CustomContainer(this, {
            title: "",
            x: turndisplay.x + turndisplay.width / 2,
            y: turndisplay.y + turndisplay.height / 2,
            width: turndisplay.width,
            height: turndisplay.height,
            opacity: 0.25,
        });

        turnPanel.setDepth(-1);

        const actualTurnCellH = 7;
        const turnCellH = 5;
        const turnCellW = 4;

        const turnGrid = GridUtils.uiGrid(
            0,
            0,
            turnPanel.width,
            turnPanel.height,
            this.gamePayload?.playerTurns?.length * 10,
            9,
        );

        const firstCell = turnGrid.getArea(1, 1, turnCellW, actualTurnCellH);
        const otherCellW = turnCellW * 0.75;
        const otherStartCol = turnCellW + 1;

        this.gamePayload?.playerTurns?.forEach((entityId, index) => {
            const entity = this.gamePayload.entities.find(
                (entity) => entity.entityId === entityId,
            );
            const player = this.gamePayload.players.find(
                (player) => player.entityId === entityId,
            );
            const charClass = this.classStore.classes.find(
                (charClass) => charClass.id === entity?.classId,
            );
            const isFirstCell = index === 0;

            const col = otherStartCol + (index - 1) * (otherCellW + 1);
            const otherCell = turnGrid.getArea(col, 1, otherCellW, turnCellH);

            new CustomContainer(this, {
                title: player?.name ?? charClass?.name?.split(" ")[0] ?? "",
                x:
                    turnPanel.x -
                    turnPanel.width / 2 +
                    (isFirstCell ? firstCell : otherCell).centerX +
                    (isFirstCell ? 0 : 50),
                y:
                    turnPanel.y -
                    turnPanel.height / 2 +
                    (isFirstCell ? firstCell : otherCell).centerY,
                width: (isFirstCell ? firstCell : otherCell).width,
                height: (isFirstCell ? firstCell : otherCell).height,
                borderWidth: isFirstCell ? 5 : 2,
                borderColor: isFirstCell
                    ? Color.actualTurnBorder
                    : Color.otherTurnBorder,
                backgroundImage: charClass?.iconImageKey,
                opacity: isFirstCell ? 1 : 0.7,
            });
        });
    }
}

