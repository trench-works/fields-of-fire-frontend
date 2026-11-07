import {
    BaseScene,
    MenuButton,
    BaseSceneInit,
    StartSceneConfig,
    i18n,
} from "../../core";
import { MainMenu } from "../MainMenu/main-menu.scene";
import { SceneAssetId } from "../../assets/ScenesAsset";
import { BackgroundAssetId } from "../../assets/BackgroundAsset";
import { MusicAsset, MusicAssetId } from "../../assets";
import { PlayMenuRoot } from "./play-menu.root";

export class PlayMenuScene extends BaseScene {
    public root: PlayMenuRoot;

    static start(scene: BaseScene, config?: StartSceneConfig | undefined) {
        super.startScene(scene, SceneAssetId.LOBBY_LIST, {
            data: null,
            config,
        });
    }

    constructor() {
        super(SceneAssetId.LOBBY_LIST, BackgroundAssetId.LOBBY, {
            division: { vertical: 1, horizontal: 2 },
        });
        this.root = new PlayMenuRoot(this);
    }

    preload() {
        super.preload();
        MusicAsset.load(this.load, MusicAssetId.MENU);
    }

    init(data: BaseSceneInit) {
        super.init(data);
        this.root.controllers.play.init();
    }

    create() {
        super.create();
        this.playBackgroundMusic(MusicAssetId.MENU);
        this.root.controllers.play.create();

        new MenuButton(this, {
            position: "topRight",
            buttons: [
                {
                    title: i18n.translate("menuPanel.back"),
                    close: true,
                },
                {
                    title: i18n.translate("menuPanel.mainMenu"),
                    onClick: () => {
                        MainMenu.start(this);
                    },
                },
            ],
        });
    }
}

