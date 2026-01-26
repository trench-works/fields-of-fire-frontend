import { Scene } from 'phaser';
import { Character } from "../Model/Character";

export class FightScene extends Scene {

    public backgroundImage!: string;
    public fightMap!: string;
    public characterList!: Character[]; 


    constructor() {
        super({ key: "fightScene" });
    }

    preload() {
        this.load.tilemapTiledJSON(this.fightMap, `assets/maps/${this.fightMap}.json`);
        this.load.image(this.backgroundImage, `assets/backgrounds/${this.backgroundImage}.png`);

        for (const character of this.characterList) {
            this.load.spritesheet(
                character.sprite,
                `assets/sprites/${character.sprite}.png`,
                { frameWidth: 64, frameHeight: 64 }
            );
        }
        
    }

    create() {
        this.add.image(400, 300, this.backgroundImage).setDepth(-1);
        this.generateMap();
    }

    generateMap() {
        const map = this.make.tilemap({ key: this.fightMap });
        const tileset = map.addTilesetImage("tileset", "tiles");
        const groundLayer = map.createLayer("ground", tileset!, 0, 0);
        const playerLayer = map.createLayer("player", tileset!, 0, 0);

        groundLayer?.setDepth(0);
        playerLayer?.setDepth(1);

    }
}
