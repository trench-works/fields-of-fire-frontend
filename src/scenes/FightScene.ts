import { Scene } from 'phaser';
import { Character } from "../Model/Character";
import { Utils } from '../core/Utils';


export class FightScene extends Scene {

    public backgroundImage = "red_bg";
    public fightMap = "chessmap";
    public characterList?: Character[]; 
    public tileSetImage = "damier";
    public tileWidth = 64;


    constructor() {
        super({ key: "fightScene" });
    }

    preload() {
        this.load.tilemapTiledJSON(this.fightMap, `assets/${this.fightMap}.json`);
        this.load.image("groundTiles", `assets/${this.tileSetImage}.png`);
        this.load.image(this.backgroundImage, `assets/${this.backgroundImage}.jpg`);

        if (!this.characterList) return;
        for (const character of this.characterList) {
            this.load.spritesheet(
                character.sprite,
                `assets/sprites/${character.sprite}.png`,
                { frameWidth: 64, frameHeight: 64 }
            );
        }
        
    }

    create() {
        const bg = this.add.image(0, 0, this.backgroundImage).setOrigin(0, 0).setDepth(-1);
        bg.setDisplaySize(this.scale.width, this.scale.height);

        this.generateMap();
    }

    generateMap() {
        
        const map = this.make.tilemap({ key: this.fightMap });
        const tileset = map.addTilesetImage(this.tileSetImage, "groundTiles");
        
        const centerMap = Utils.scaleAndCenter({parentHeight: this.scale.height, parentWidth: this.scale.width, childHeight: map.heightInPixels, childWidth: map.widthInPixels , isometricVariation: true});
        const groundLayer = map.createLayer("Ground", tileset!, centerMap.offsetX, centerMap.offsetY);

        groundLayer?.setScale(centerMap.scaleFactor);
        groundLayer?.setDepth(0);
    }

}