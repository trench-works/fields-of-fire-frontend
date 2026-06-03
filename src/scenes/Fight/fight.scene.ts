import { Character } from "./components/character/Character";
import {
    GridUtils,
    Position,
    PositionUtils,
    MenuButton,
    BaseScene,
} from "../../core";
import { SceneConfig } from "../../config/SceneConfig";
import { RangeVisualizer } from "./objects/RangeVisualizer";
import { GamePlayerSocket } from "./repositories/player.socket";
import { ActionManager } from "./objects/ActionManager";
import { Tooltip } from "../../core/UI/Tooltip";
import { Game } from "../../Model/Game";
import { ClassesRepository } from "../Lobby/repositories/classes.repository";
import { MainMenu } from "../MainMenu/main-menu.scene";
import { ActionDisplayer } from "./components/ActionDisplayer";
import {
    ActionAsset,
    CharacterCloseupAsset,
    CharacterSpriteAsset,
    IconAsset,
    MiscAsset,
    MiscAssetId,
} from "../../assets";
import { BackgroundAssetId } from "../../assets/BackgroundAsset";
import { ClassStore } from "./stores/ClassStore";
import { GameStore } from "./stores/GameStore";
import { PlayerStore } from "./stores/PlayerStore";
import { BoardDisplayer } from "./components/BoardDisplayer";
import { CharactersDisplayer } from "./components/character/CharactersDisplayer";
import { TurnDisplayer } from "./components/TurnsDisplayer";
import { StatsDisplayer } from "./components/StatsDisplayer";
import { SceneAssetId } from "../../assets/ScenesAsset";

export type SceneRenderConfig = {
    tileSize: number;
    renderType: string;
    offset: Position;
};

export type RenderResult = {
    position: Position;
    sprite: string;
};

export type Cell = {
    gridPosition: Position;
    pixelPosition: Position;
    zone: Phaser.GameObjects.Zone;
    hoverGraphics?: Phaser.GameObjects.Graphics;
    highlight?: Phaser.GameObjects.Graphics;
};

export interface Displayable {
    render(renderConfig: SceneRenderConfig): RenderResult | RenderResult[];
}

export type FightSceneInit = {
    game: Game;
    player: { playerId: string };
};

export class FightScene extends BaseScene {
    public renderConfig: SceneRenderConfig;
    public sceneGrid = GridUtils.uiGrid(0, 0);

    /**
     * Stores
     */
    protected classStore: ClassStore;
    protected gameStore: GameStore;
    protected playerStore: PlayerStore;

    /**
     * Displayers
     */
    private actions: ActionDisplayer;
    private board: BoardDisplayer;
    private character: CharactersDisplayer;
    private turns: TurnDisplayer;
    private playerStats: StatsDisplayer;
    private inspectStats: StatsDisplayer;

    /**
     * Sockets
     */
    public playerSocket!: GamePlayerSocket;

    /**
     * Utils
     */
    public actionManager: ActionManager;
    public rangeVisualizer: RangeVisualizer;

    public tooltip!: Tooltip;

    public fightMap = "chessmap";
    public characters: Character[] = [];
    public myPlayer!: Character;
    public gridPositions: Cell[][] = [];
    public scaleFactor: number = 1;

    constructor() {
        super(SceneAssetId.FIGHT, BackgroundAssetId.FIGHT);

        /**
         * Stores
         */
        this.classStore = new ClassStore();
        this.gameStore = new GameStore();
        this.playerStore = new PlayerStore(this.classStore, this.gameStore);

        /**
         * Displayers
         */
        this.actions = new ActionDisplayer(
            this,
            this.gameStore,
            this.playerStore,
        );
        this.board = new BoardDisplayer(this, this.gameStore);
        this.character = new CharactersDisplayer(
            this,
            this.gameStore,
            this.classStore,
        );
        this.turns = new TurnDisplayer(this, this.gameStore, this.classStore);
        this.playerStats = new StatsDisplayer(this, this.gameStore, {
            x: 0,
            y: 6,
        });
        this.inspectStats = new StatsDisplayer(this, this.gameStore, {
            x: 7,
            y: 6,
        });

        /**
         * Utils
         */
        this.actionManager = new ActionManager(this);
        this.rangeVisualizer = new RangeVisualizer(this, this.gameStore);

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
    }

    static start(scene: Phaser.Scene, data: FightSceneInit) {
        scene.scene.start(SceneAssetId.FIGHT, data);
    }

    init({ game, player: { playerId } }: FightSceneInit) {
        this.gameStore.setGame(game);
        this.playerStore.setPlayerId(playerId);

        this.actions.preRender();
        this.board.preRender();
        this.turns.preRender();
        this.character.preRender();
        this.playerStats.preRender();
        this.inspectStats.preRender();

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
            this.board.update();
            this.actions.update();
            this.turns.update();
            this.character.update();
            this.playerStats
                .setEntity(this.playerStore.playerEntity)
                .setCharacterClass(this.playerStore.playerClass)
                .setName(user.username)
                .update();
        });
    }

    preload() {
        super.preload();
        ActionAsset.loadAll(this.load);

        this.load.tilemapTiledJSON(
            this.fightMap,
            `assets/${this.fightMap}.json`,
        );

        MiscAsset.load(this.load, MiscAssetId.GROUND_TILE);
        CharacterCloseupAsset.loadAll(this.load);
        CharacterSpriteAsset.loadAll(this.load);

        IconAsset.loadAll(this.load);
    }

    create() {
        super.create();
        this.tooltip = Tooltip.getInstance(this, {
            textColor: "#000000",
            fontSize: 14,
            delay: 750,
        });

        this.actions.render().update();
        this.board.render().update();
        this.character.render().update();
        this.turns.render();
        this.playerStats
            .setEntity(this.playerStore.playerEntity)
            .setCharacterClass(this.playerStore.playerClass)
            .setName(user.username)
            .render()
            .update();
        this.inspectStats.render().setIsShow(false);

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

        this.events.on("characterClicked", (entityId: string) => {
            this.inspectCharacter(entityId);
        });
    }

    public inspectCharacter(entityId: string) {
        const entity = this.gameStore.getEntity(entityId);
        const charClass = this.classStore.getClass(entity.classId);
        this.inspectStats
            .setEntity(entity)
            .setCharacterClass(charClass)
            .setName(charClass.name.split(" ")[0])
            .update()
            .setIsShow(true);
    }
}

