import {
    Position,
    MenuButton,
    BaseScene,
    BaseSceneInit,
    i18n,
} from "../../core";
import { Tooltip } from "../../core/UI/Tooltip";
import { Game } from "../../Model/Game";
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
import { BoostAsset } from "../../assets/BoostAsset";
import { FightSceneRoot } from "./fight-scene.root";
import { Tile } from "../../core/UI/TileLayer";
import { Color } from "../../config/ColorConfig";

export type SceneRenderConfig = {
    tileSize: number;
    offset: Position;
};

export type RenderResult = {
    position: Position;
    sprite: string;
};

export class Cell extends Tile {
    zone?: Phaser.GameObjects.Zone;
    hoverGraphics?: Phaser.GameObjects.Graphics;
    rangeHighlight?: Phaser.GameObjects.Graphics;
    teamColor?: Phaser.GameObjects.Graphics;
    spellHighlight?: Phaser.GameObjects.Graphics;

    destoy(): this {
        this.rangeHighlight?.destroy();
        this.hoverGraphics?.destroy();
        this.zone?.destroy();
        this.spellHighlight?.destroy();
        this.teamColor?.destroy();
        return this;
    }
}

export interface Displayable {
    render(renderConfig: SceneRenderConfig): RenderResult | RenderResult[];
}

export type FightSceneInit = {
    game: Game;
    player: { id: string };
};

export class FightScene extends BaseScene<FightSceneInit> {
    public root: FightSceneRoot;

    public tooltip!: Tooltip;

    public scaleFactor: number = 1;

    constructor() {
        super(SceneAssetId.FIGHT, BackgroundAssetId.FIGHT);

        this.root = new FightSceneRoot(this);
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
        // Créer le bouton Menu
        new MenuButton(this, {
            position: "topRight",
            buttons: [
                {
                    title: i18n.translate("menuPanel.back"),
                    close: true,
                },
                {
                    title: i18n.translate("menuPanel.mainMenu"),
                    onClick: () => {
                        this.root.controllers.game.disconnect();
                    },
                },
                {
                    title: i18n.translate("menuPanel.leaveGame"),
                    onClick: () => {
                        this.root.controllers.game.leave();
                    },
                },
            ],
        });
        super.create();
        this.playBackgroundMusic(MusicAssetId.FIGHT);
        this.tooltip = Tooltip.getInstance(this, {
            textColor: Color.BLACK,
            fontSize: 14,
            delay: 750,
        });

        this.root.controllers.game.create();
    }
}

