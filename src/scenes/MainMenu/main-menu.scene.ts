import {
    BaseScene,
    Button,
    DisplayText,
    i18n,
    ScaleMode,
    SoundLevel,
    StartSceneConfig,
} from "../../core";
import { BackgroundAssetId } from "../../assets/BackgroundAsset";
import { LobbyListScene } from "../LobbyList/lobby-list.scene";
import { PopupInput } from "./objects/LoginPopup";
import { UserRepository } from "./repositories/user.repository";
import { SceneAssetId } from "../../assets/ScenesAsset";
import { MiscAsset, MiscAssetId, MusicAsset, MusicAssetId } from "../../assets";
import { ParameterScene } from "../Parameter/parameter.scene";
import { translate } from "../../core/i18n/i18n";
import { SoundParam } from "../../core/Utils/SoundLevel";

export class MainMenu extends BaseScene {
    private playButton!: Button;
    private registerButton!: Button;
    private logginButton!: Button;

    constructor() {
        super(SceneAssetId.MENU, BackgroundAssetId.MAIN_MENU, {
            division: { vertical: 7, horizontal: 5 },
        });
        const user = localStorage.getItem("user");
        if (user) {
            globalThis.user = JSON.parse(user);
        }
    }

    static start(scene: BaseScene, config?: StartSceneConfig | undefined) {
        super.startScene(scene, SceneAssetId.MENU, {
            data: null,
            config,
        });
    }

    preload() {
        super.preload();
        MiscAsset.load(this.load, MiscAssetId.BUTTON);
        MusicAsset.load(this.load, MusicAssetId.MENU);
    }

    create() {
        super.create();
        this.playBackgroundMusic(MusicAssetId.MENU);
        // Créer un titre du menu
        new DisplayText(
            this,
            this.rootGrid.getArea({
                x: 1,
                y: 2,
                width: 5,
                height: 1,
            }),
        ).setText(translate("common.title"));

        const buttonsGrid = this.rootGrid.getSubGrid(
            {
                x: 3,
                y: 3,
                width: 1,
                height: 5,
            },
            {
                division: { vertical: 3, horizontal: 1 },
                padding: { vertical: 60, horizontal: 0 },
            },
        );
        // Bouton Jouer (ligne 0)
        this.playButton = new Button(
            this,
            buttonsGrid
                .getArea({
                    x: 1,
                    y: 1,
                    width: 1,
                    height: 1,
                })
                .scaleFromCenter(
                    MiscAsset.getAssetScale(MiscAssetId.BUTTON),
                    ScaleMode.CONSERVE,
                ),
            {
                text: i18n.translate("mainMenu.play"),
                image: MiscAsset.getAssetKey(MiscAssetId.BUTTON),
                onClick: () => {
                    LobbyListScene.start(this);
                },
            },
        ).setIsActivated(Boolean(globalThis.user));

        // Bouton Paramètres (ligne 1)
        new Button(
            this,
            buttonsGrid
                .getArea({
                    x: 1,
                    y: 2,
                    width: 1,
                    height: 1,
                })
                .scaleFromCenter(
                    MiscAsset.getAssetScale(MiscAssetId.BUTTON),
                    ScaleMode.CONSERVE,
                ),
            {
                text: i18n.translate("mainMenu.settings"),
                image: MiscAsset.getAssetKey(MiscAssetId.BUTTON),
                onClick: () => {
                    ParameterScene.start(this);
                },
            },
        );

        this.registerButton = new Button(
            this,
            this.rootGrid
                .getArea({
                    x: 4,
                    y: 1,
                    width: 1,
                    height: 1,
                    margin: 20,
                })
                .scaleFromCenter(
                    MiscAsset.getAssetScale(MiscAssetId.BUTTON),
                    ScaleMode.FIT,
                ),
            {
                text:
                    globalThis.user?.username ??
                    i18n.translate("mainMenu.register"),
                image: MiscAsset.getAssetKey(MiscAssetId.BUTTON),
                onClick: () => {
                    new PopupInput(this, {
                        title: i18n.translate("mainMenu.register"),
                        onValidate: async (
                            username: string,
                            password: string,
                        ) => {
                            await new UserRepository().register(
                                username,
                                password,
                            );
                            if (globalThis.user) {
                                this.playButton.alpha = 1;
                                this.registerButton.setIsActivated(false);
                                console.log(
                                    "register globo : ",
                                    globalThis.user.username,
                                );
                                this.registerButton.displayText(
                                    globalThis.user.username,
                                );
                                localStorage.setItem(
                                    "user",
                                    JSON.stringify(globalThis.user),
                                );
                                this.updateLoginButtons();
                                return true;
                            }
                            return false;
                        },
                    });
                },
            },
        ).setIsActivated(!globalThis.user);

        //bouton login
        this.logginButton = new Button(
            this,
            this.rootGrid
                .getArea({
                    x: 5,
                    y: 1,
                    width: 1,
                    height: 1,
                    margin: 20,
                })
                .scaleFromCenter(
                    MiscAsset.getAssetScale(MiscAssetId.BUTTON),
                    ScaleMode.FIT,
                ),
            {
                text: globalThis.user
                    ? i18n.translate("mainMenu.disconnect")
                    : i18n.translate("mainMenu.login"),
                image: MiscAsset.getAssetKey(MiscAssetId.BUTTON),
                onClick: () => {
                    if (globalThis.user) {
                        localStorage.removeItem("user");
                        globalThis.user = undefined;
                    } else {
                        new PopupInput(this, {
                            title: i18n.translate("mainMenu.login"),
                            onValidate: async (
                                username: string,
                                password: string,
                            ) => {
                                await new UserRepository().authenticate(
                                    username,
                                    password,
                                );
                                if (globalThis.user) {
                                    this.playButton.alpha = 1;
                                    this.registerButton.setIsActivated(false);
                                    this.registerButton.displayText(
                                        globalThis.user.username,
                                    );
                                    localStorage.setItem(
                                        "user",
                                        JSON.stringify(globalThis.user),
                                    );
                                    this.updateLoginButtons();
                                    return true;
                                }
                                return false;
                            },
                        });
                    }
                    this.updateLoginButtons();
                },
            },
        ).setIsActivated(true);

        console.log(
            "musicSound - MENU : ",
            SoundLevel.get(SoundParam.BACKGROUND),
        );
    }

    updateLoginButtons() {
        this.logginButton.displayText(
            globalThis.user
                ? i18n.translate("mainMenu.disconnect")
                : i18n.translate("mainMenu.login"),
        );
        this.registerButton.displayText(
            globalThis.user?.username ?? i18n.translate("mainMenu.register"),
        );
        this.registerButton.setIsActivated(!globalThis.user);
        this.playButton.setIsActivated(Boolean(globalThis.user));
    }
}

