import { Game } from "phaser";
import { MainMenu } from "./scenes/MainMenu/main-menu.scene";
import { FightScene } from "./scenes/Fight/fight.scene";
import { LobbyScene } from "./scenes/Lobby/lobby.scene";
import { App } from "./config/AppConfig";
import { LobbyListScene } from "./scenes/LobbyList/lobby-list.scene";
import { ParameterScene } from "./scenes/Parameter/parameter.scene";

//  Find out more information about the Game Config at: https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig

declare global {
    var config: App;
    var user:
        | {
              id: string;
              username: string;
          }
        | undefined;
}

export default new Game({
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    scale: {
        mode: Phaser.Scale.RESIZE, // <— ajuste le canvas automatiquement
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
        default: "arcade",
        arcade: { debug: false },
    },
    scene: [MainMenu, LobbyListScene, LobbyScene, FightScene, ParameterScene],
});

