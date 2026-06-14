import { Scene } from "phaser";
import { SceneAssetId } from "../../assets/ScenesAsset";
import {
    BackgroundAsset,
    BackgroundAssetId,
} from "../../assets/BackgroundAsset";
import { Grid } from "../Utils";
import { TwoAxis } from "../Types";
import { MusicAsset, MusicAssetId } from "../../assets";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class BaseScene<InitData = any> extends Scene {
    public rootGrid: Grid;

    protected backgroundSound?:
        | Phaser.Sound.NoAudioSound
        | Phaser.Sound.HTML5AudioSound
        | Phaser.Sound.WebAudioSound;

    protected isOpen: boolean;

    constructor(
        key: SceneAssetId,
        protected readonly background: BackgroundAssetId,
        rootGridOptions?: { division: TwoAxis },
    ) {
        super({ key });
        this.isOpen = false;
        this.rootGrid = new Grid(rootGridOptions);
    }

    // eslint-disable-next-line unused-imports/no-unused-vars, @typescript-eslint/no-unused-vars
    init(data?: InitData) {
        this.isOpen = true;
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
        if (this.isOpen) {
            if (!this.backgroundSound) {
                this.backgroundSound = this.sound.add(
                    MusicAsset.getAssetKey(id),
                );
                this.backgroundSound.setLoop(true);
                this.backgroundSound.setVolume(0.4);
            }
            this.backgroundSound.play();
            this.sound.unlock();
        }
    }

    stopBackgroundMusic() {
        if (this.backgroundSound) {
            this.backgroundSound.stop();
        }
    }

    close() {
        this.isOpen = false;
        this.stopBackgroundMusic();
    }
}

