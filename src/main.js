import { Game } from 'phaser';
import { MainMenu } from './scenes/MainMenu';
import { FightScene } from './scenes/FightScene';

//  Find out more information about the Game Config at: https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    scene: [
        FightScene,
    ]
};

export default new Game(config);
