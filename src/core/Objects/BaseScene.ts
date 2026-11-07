import { Scene } from "phaser";
import { SceneAssetId } from "../../assets/ScenesAsset";
import {
    BackgroundAsset,
    BackgroundAssetId,
} from "../../assets/BackgroundAsset";
import { Grid, ScaleMode, SoundLevel } from "../Utils";
import { Size, TwoAxis } from "../Types";
import { MusicAsset, MusicAssetId } from "../../assets";
import { Sound } from "../Types/Sound";
import { AssetLoader } from "./Loader";
import { i18n } from "../i18n";
import { SoundParam } from "../Utils/SoundLevel";

export type BaseSceneInit<InitData = never> = {
    data: InitData;
    config?: StartSceneConfig;
};

export type StartSceneConfig = {
    keepMusic?: boolean;
    backgroundMusic?: Sound;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class BaseScene<InitData = any> extends Scene {
    public rootGrid: Grid;

    protected backgroundSound?: Sound;

    protected isOpen: boolean;

    protected startConfig: StartSceneConfig;

    protected bgScaleMode: ScaleMode.FIT | ScaleMode.FILL;

    constructor(
        public readonly key: SceneAssetId,
        protected readonly background: BackgroundAssetId,
        options?: {
            scale?: ScaleMode.FIT | ScaleMode.FILL;
            grid?: { division: TwoAxis };
        },
    ) {
        super({ key });
        i18n.loadBase();
        this.isOpen = false;
        this.rootGrid = new Grid(options?.grid);
        this.startConfig = {};
        this.bgScaleMode = options?.scale ?? ScaleMode.FIT;
    }

    get isCurrentScene(): boolean {
        return this.key === globalThis.currentScene;
    }

    static startScene<InitData = never>(
        scene: BaseScene,
        id: SceneAssetId,
        data: BaseSceneInit<InitData>,
    ) {
        if (scene.isCurrentScene) {
            if (data.config?.keepMusic ?? true) {
                data.config ??= {};
                data.config.backgroundMusic = scene.backgroundSound;
            }
            scene.close(data.config?.keepMusic);
            globalThis.currentScene = id;
            scene.scene.start(id, data);
        }
    }

    init(init: BaseSceneInit<InitData>) {
        document.addEventListener("contextmenu", (event) => {
            event.preventDefault();
        });
        this.isOpen = true;
        this.startConfig = init?.config ?? {};
        if (init?.config?.backgroundMusic) {
            if (this.backgroundSound) {
                this.backgroundSound.stop();
                this.backgroundSound.destroy();
            }
            this.backgroundSound = init?.config?.backgroundMusic;
        }
        globalThis.currentScene = this.key;
    }

    preload() {
        BackgroundAsset.load(this.load, this.background);
        new AssetLoader(this);
    }

    create() {
        const scale: Size = {
            width: this.scale.width,
            height: this.scale.height,
        };
        const imageScale = BackgroundAsset.getAssetSize(this.background);
        const ratio: Size = {
            width: scale.width / imageScale.width,
            height: scale.height / imageScale.height,
        };
        if (ratio.height > ratio.width) {
            scale.width = imageScale.width * ratio.height;
        } else {
            scale.height = imageScale.height * ratio.width;
        }
        this.add
            .image(
                this.scale.width / 2,
                this.scale.height / 2,
                BackgroundAsset.getAssetKey(this.background),
            )
            .setOrigin(0.5, 0.5)
            .setDepth(-1)
            .setDisplaySize(scale.width, scale.height);
    }

    playBackgroundMusic(id: MusicAssetId) {
        if (this.isOpen) {
            this.sound.stopAll();
            this.backgroundSound?.destroy();
            this.backgroundSound = this.sound
                .add(MusicAsset.getAssetKey(id))
                .setLoop(true)
                .setVolume(
                    SoundLevel.get(SoundParam.BACKGROUND) *
                        MusicAsset.getBaseSoundLevel(id),
                );
            if (!this.backgroundSound.isPlaying) {
                this.sound.stopAll();
                this.backgroundSound.play();
                this.sound.unlock();
            }
        }
    }

    stopBackgroundMusic() {
        this.backgroundSound?.stop();
    }

    close(keepMusic: boolean = true) {
        this.isOpen = false;
        if (!keepMusic) {
            this.stopBackgroundMusic();
        }
    }
}

