import {
    Position,
    MenuButton,
    BaseScene,
    BaseSceneInit,
    KeyBindUtils,
} from "../../core";
import { SceneConfig } from "../../config/SceneConfig";
import { Tooltip } from "../../core/UI/Tooltip";
import { Game } from "../../Model/Game";
import { MainMenu } from "../MainMenu/main-menu.scene";
import {
    ActionAnimationAsset,
    ActionAsset,
    CharacterCloseupAsset,
    CharacterSpriteAsset,
    StatsIconAsset,
    MiscAsset,
    MiscAssetId,
    MusicAsset,
    MusicAssetId,
    SoundEffectAsset,
    MiscAnimationId,
    MiscAnimationAsset,
} from "../../assets";
import { BackgroundAssetId } from "../../assets/BackgroundAsset";
import { SceneAssetId } from "../../assets/ScenesAsset";
import { ParticleAsset } from "../../assets/ParticleAsset";
import { EffectAsset } from "../../assets/EffectAsset";
import { PositionUtils } from "../../core/Utils/Sizing";
import { ParticleDisplayer } from "./display/particles.displayer";
import { BoostAsset } from "../../assets/BoostAsset";
import { KeyBinds } from "../../core/keybinds/keybinds";
import { FightSceneRoot } from "./fight-scene.root";

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
    zone?: Phaser.GameObjects.Zone;
    hoverGraphics?: Phaser.GameObjects.Graphics;
    highlight?: Phaser.GameObjects.Graphics;
};

export interface Displayable {
    render(renderConfig: SceneRenderConfig): RenderResult | RenderResult[];
}

export type FightSceneInit = {
    game: Game;
    player: { id: string };
};

export class FightScene extends BaseScene<FightSceneInit> {
    public renderConfig: SceneRenderConfig;

    public root: FightSceneRoot;

    public tooltip!: Tooltip;
    protected windEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

    public fightMap = "chessmap";
    public gridPositions: Cell[][] = [];
    public scaleFactor: number = 1;
    public particleDisplayer: ParticleDisplayer = new ParticleDisplayer(this);
    public keyBinds: KeyBinds;

    constructor() {
        super(SceneAssetId.FIGHT, BackgroundAssetId.FIGHT);

        this.keyBinds = KeyBindUtils.getKeyBinds();

        this.root = new FightSceneRoot(this);

        const config = new SceneConfig().loadConfig().getConfig("scene_1");
        if (!config) {
            throw new Error("Config doesnt exist");
        }

        this.renderConfig = {
            tileSize: config.render_config.tile_size,
            renderType: config.render_config.render_type,
            offset: { x: 0, y: 0 },
        };
        this.renderConfig.offset = PositionUtils.getMapOffset(
            this.renderConfig,
        );
    }

    static start(scene: BaseScene, data: BaseSceneInit<FightSceneInit>) {
        data.config ??= {};
        data.config.keepMusic = false;
        super.startScene(scene, SceneAssetId.FIGHT, data);
    }

    init(init: BaseSceneInit<FightSceneInit>) {
        super.init(init);
        this.root.controllers.game.init(init.data);
    }

    preload() {
        super.preload();

        this.load.tilemapTiledJSON(
            this.fightMap,
            `assets/${this.fightMap}.json`,
        );

        ActionAsset.loadAll(this.load);
        ActionAnimationAsset.loadAll(this.load);
        ParticleAsset.loadAll(this.load);
        MiscAsset.load(this.load, MiscAssetId.GROUND);
        MiscAsset.load(this.load, MiscAssetId.WALL);
        CharacterCloseupAsset.loadAll(this.load);
        CharacterSpriteAsset.loadAll(this.load);
        StatsIconAsset.loadAll(this.load);
        EffectAsset.loadAll(this.load);
        MusicAsset.load(this.load, MusicAssetId.FIGHT);
        SoundEffectAsset.loadAll(this.load);
        MiscAnimationAsset.load(this.load, MiscAnimationId.BLOOD_SPLATTER);
        BoostAsset.loadAll(this.load);
    }

    create() {
        super.create();
        this.tooltip = Tooltip.getInstance(this, {
            textColor: "#000000",
            fontSize: 14,
            delay: 750,
        });

        this.root.controllers.game.create();

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
                this.root.controllers.game.disconnect();
                MainMenu.start(this, { keepMusic: false });
            },
        });

        this.particleDisplayer.windAnimation();

        // --- Placement des icônes ---

        this.events.on("characterClicked", (entityId: string) => {
            this.root.controllers.game.inspectCharacter(entityId);
        });
    }
}

