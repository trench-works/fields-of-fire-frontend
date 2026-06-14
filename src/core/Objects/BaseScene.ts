import { Scene } from "phaser";
import { SceneAssetId } from "../../assets/ScenesAsset";
import {
    BackgroundAsset,
    BackgroundAssetId,
} from "../../assets/BackgroundAsset";
import { Grid } from "../Utils";
import { TwoAxis } from "../Types";
import { MusicAsset, MusicAssetId } from "../../assets";
import { Sound } from "../Types/Sound";

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

    constructor(
        key: SceneAssetId,
        protected readonly background: BackgroundAssetId,
        rootGridOptions?: { division: TwoAxis },
    ) {
        super({ key });
        this.isOpen = false;
        this.rootGrid = new Grid(rootGridOptions);
        this.startConfig = {};
    }

    static startScene<InitData = never>(
        scene: BaseScene,
        id: SceneAssetId,
        data: BaseSceneInit<InitData>,
    ) {
        if (data.config?.keepMusic ?? true) {
            console.log("KEEP MUSIC");
            data.config ??= {};
            data.config.backgroundMusic = scene.backgroundSound;
            console.log(scene.backgroundSound);
        }
        scene.close(data.config?.keepMusic);
        scene.scene.start(id, data);
    }

    init(init: BaseSceneInit<InitData>) {
        console.log("INIT", init);
        this.isOpen = true;
        this.startConfig = init?.config ?? {};
        if (init?.config?.backgroundMusic) {
            if (this.backgroundSound) {
                this.backgroundSound.stop();
                this.backgroundSound.destroy();
            }
            this.backgroundSound = init?.config?.backgroundMusic;
            console.log("INIT", this.backgroundSound);
        }
    }

    preload() {
        BackgroundAsset.load(this.load, this.background);
    }

    create() {
        const bg = this.add
            .image(0, 0, BackgroundAsset.getAssetKey(this.background))
            .setOrigin(0, 0)
            .setDepth(-1);
        bg.setDisplaySize(this.scale.width, this.scale.height);
    }

    playBackgroundMusic(id: MusicAssetId) {
        console.log("PLAY", this.backgroundSound);
        if (this.isOpen) {
            if (!this.backgroundSound) {
                this.backgroundSound = this.sound.add(
                    MusicAsset.getAssetKey(id),
                );
                this.backgroundSound.setLoop(true);
                this.backgroundSound.setVolume(0.4);
            }
            if (!this.backgroundSound.isPlaying) {
                this.backgroundSound.play();
                this.sound.unlock();
            }
        }
    }

    stopBackgroundMusic() {
        if (this.backgroundSound) {
            this.backgroundSound.stop();
        }
    }

    close(keepMusic: boolean = true) {
        this.isOpen = false;
        if (!keepMusic) {
            this.stopBackgroundMusic();
        }
    }
}

