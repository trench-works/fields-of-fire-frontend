export abstract class AssetManager<AssetId extends string, AssetType> {
    constructor(
        protected readonly assetKey: string,
        protected readonly assets: Record<AssetId, AssetType>,
    ) {}

    protected abstract getIds(): AssetId[];
    protected abstract getAssetFileLink(
        assetKey: string,
        asset: AssetType,
    ): string;

    protected isAssetId(id: string): id is AssetId {
        return this.getIds().includes(id as AssetId);
    }

    loadAll(load: Phaser.Loader.LoaderPlugin): void {
        for (const id of this.getIds()) {
            this.load(load, id);
        }
    }

    load(load: Phaser.Loader.LoaderPlugin, id: string): void {
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

    abstract loader(
        load: Phaser.Loader.LoaderPlugin,
        id: string,
        asset: Record<AssetId, AssetType>[AssetId],
    ): void;

    getAssetKey(id: string): string {
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
    constructor(assetKey: string, assets: Record<AssetId, AssetType>) {
        super(assetKey, assets);
    }

    loader(
        load: Phaser.Loader.LoaderPlugin,
        id: string,
        asset: Record<AssetId, AssetType>[AssetId],
    ) {
        load.image(
            this.getAssetKey(id),
            this.getAssetFileLink(this.assetKey, asset),
        );
    }
}

export abstract class SpriteAssetManager<
    AssetId extends string,
    AssetType,
> extends ImageAssetManager<AssetId, AssetType> {
    constructor(
        assetKey: string,
        assets: Record<AssetId, AssetType>,
        protected readonly frameConfig: Phaser.Types.Loader.FileTypes.ImageFrameConfig,
    ) {
        super(assetKey, assets);
    }

    loader(
        load: Phaser.Loader.LoaderPlugin,
        id: string,
        asset: Record<AssetId, AssetType>[AssetId],
    ) {
        load.spritesheet(
            this.getAssetKey(id),
            this.getAssetFileLink(this.assetKey, asset),
            this.frameConfig,
        );
    }
}

