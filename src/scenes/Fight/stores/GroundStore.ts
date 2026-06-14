export class GroundStore {
    public groundLayer: Phaser.Tilemaps.TilemapLayer | null;

    constructor() {
        this.groundLayer = null;
    }

    setGroundLayer(groundLayer: Phaser.Tilemaps.TilemapLayer | null) {
        this.groundLayer = groundLayer;
    }
}

