export abstract class ImageAssetManager<AssetId extends string, AssetType> {
    constructor(
        private readonly assetKey: string,
        private readonly ASSETS: Record<AssetId, AssetType>,
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
            console.error(`${id} not a action asset id`);
            return;
        }
        const asset = this.ASSETS[id];
        if (!asset) {
            console.error(`Asset ${id} not found`);
            return;
        }
        load.image(
            this.getAssetKey(id),
            this.getAssetFileLink(this.assetKey, asset),
        );
    }

    getAssetKey(id: AssetId): string {
        if (!this.isAssetId(id)) {
            console.error(`${id} not a action asset id`);
            return "";
        }
        return `${this.assetKey}_${id}`;
    }
}

