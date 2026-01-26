import { Scene } from 'phaser';
import { Character } from "./Character";

export class FightSceneModel extends Scene {

    constructor(
        public id: string,
        public name: string,
        public backgroundImage: string,
        public fightMap: string,
        public characterList: Character[], 

    ) {
        super({ key: id });
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

    generateMap() {
        const map = this.make.tilemap({ key: this.fightMap });
        const tileset = map.addTilesetImage("tileset", "tiles");
        const groundLayer = map.createLayer("ground", tileset!, 0, 0);
        const playerLayer = map.createLayer("player", tileset!, 0, 0);

        groundLayer?.setDepth(0);
        playerLayer?.setDepth(1);

    }
}
