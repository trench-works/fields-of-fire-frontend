import { BaseScene } from "../Objects";
import { Size } from "../Types";

export abstract class AssetManager<AssetId extends string, AssetType> {
    constructor(
        protected readonly assetKey: string,
        protected readonly assets: Partial<Record<AssetId, AssetType>>,
    ) {}

    protected abstract getIds(): AssetId[];
    protected abstract getAssetFileLink(
        assetKey: string,
        asset: AssetType,
    ): string;

    protected isAssetId(id: AssetId): id is AssetId {
        return this.assets[id] !== undefined;
    }

    loadAll(load: Phaser.Loader.LoaderPlugin): void {
        for (const id of this.getIds()) {
            this.load(load, id);
        }
    }

    load(load: Phaser.Loader.LoaderPlugin, id: AssetId): void {
        if (!this.isAssetId(id)) {
            console.error(`${id} not an asset id`);
            return;
        }
        const asset = this.assets[id];
        if (!asset) {
            console.error(`Asset ${id} not found`);
            return;
        }
        this.loader(load, id, asset);
    }

    protected abstract loader(
        load: Phaser.Loader.LoaderPlugin,
        id: string,
        asset: Record<AssetId, AssetType>[AssetId],
    ): void;

    getAssetKey(id: AssetId): string {
        if (!this.isAssetId(id)) {
            console.error(`${id} not a action asset id`);
            return "";
        }
        return `${this.assetKey}_${id}`;
    }
}

export abstract class ImageAssetManager<
    AssetId extends string,
    AssetType,
> extends AssetManager<AssetId, AssetType> {
    constructor(
        assetKey: string,
        assets: Partial<Record<AssetId, AssetType>>,
        protected readonly assetScale: Record<AssetId, Size>,
    ) {
        super(assetKey, assets);
    }

    protected loader(
        load: Phaser.Loader.LoaderPlugin,
        id: AssetId,
        asset: Record<AssetId, AssetType>[AssetId],
    ) {
        load.image(
            this.getAssetKey(id),
            this.getAssetFileLink(this.assetKey, asset),
        );
    }

    getAssetScale(id: string): number {
        const size = this.assetScale[id as AssetId];
        return size.width / size.height;
    }
}

export abstract class SoundAssetManager<
    AssetId extends string,
    AssetType,
> extends AssetManager<AssetId, AssetType> {
    constructor(
        assetKey: string,
        assets: Partial<Record<AssetId, AssetType>>,
        protected readonly level: Partial<Record<AssetId, number>>,
    ) {
        super(assetKey, assets);
    }

    getBaseSoundLevel(assetId: AssetId): number {
        return this.level[assetId] ?? 1;
    }

    protected loader(
        load: Phaser.Loader.LoaderPlugin,
        id: AssetId,
        asset: Record<AssetId, AssetType>[AssetId],
    ) {
        load.audio(
            this.getAssetKey(id),
            this.getAssetFileLink(this.assetKey, asset),
        );
    }
}

export type AnimationConfiguration = {
    frameWidth: number;
    frameHeight: number;
    /**
     * Time of each frame in index order in ms, this will also define the number of displayed frames
     */
    frameTime: number[];
};

export abstract class SpriteAssetManager<
    AssetId extends string,
    AssetType,
> extends AssetManager<AssetId, AssetType> {
    constructor(
        assetKey: string,
        assets: Partial<Record<AssetId, AssetType>>,
        protected readonly frameConfigs: Partial<
            Record<AssetId, AnimationConfiguration>
        >,
    ) {
        super(assetKey, assets);
    }

    getFrameConfig(assetId: AssetId): AnimationConfiguration {
        return this.frameConfigs[assetId]!;
    }

    protected loader(
        load: Phaser.Loader.LoaderPlugin,
        id: AssetId,
        asset: Record<AssetId, AssetType>[AssetId],
    ) {
        load.spritesheet(
            this.getAssetKey(id),
            this.getAssetFileLink(this.assetKey, asset),
            this.frameConfigs[id],
        );
    }
}

export type AnimationSheetConfiguration = {
    frames: number[];
    duration: number[];
};

export abstract class SpriteSheetAssetManager<
    AssetId extends string,
    AssetType,
> extends SpriteAssetManager<AssetId, AssetType> {
    constructor(
        assetKey: string,
        assets: Partial<Record<AssetId, AssetType>>,
        frameConfigs: Partial<Record<AssetId, AnimationConfiguration>>,
        private readonly animations: Record<
            AssetId,
            Record<string, AnimationSheetConfiguration>
        >,
    ) {
        super(assetKey, assets, frameConfigs);
    }

    loadAllAnimations(scene: BaseScene) {
        for (const assetId of Object.keys(this.animations)) {
            this.loadAssetAnimations(scene, assetId as AssetId);
        }
    }

    loadAssetAnimations(scene: BaseScene, assetId: AssetId) {
        for (const [key, { frames }] of Object.entries(
            this.animations[assetId],
        )) {
            this.loadAnimation(
                scene,
                assetId,
                `${this.getAssetKey(assetId)}-${key}`,
                frames,
            );
        }
    }

    loadAnimation(
        scene: BaseScene,
        assetId: AssetId,
        animationName: string,
        frames: number[],
    ) {
        if (!scene.anims.exists(animationName)) {
            scene.anims.create({
                key: animationName,
                frames: scene.anims
                    .generateFrameNumbers(this.getAssetKey(assetId), {
                        frames,
                    })
                    .map((animation) => ({ ...animation, duration: 500 })),
                repeat: -1,
            });
        }
    }
}

