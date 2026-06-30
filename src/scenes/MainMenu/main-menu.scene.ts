import {
    BaseScene,
    Button,
    DisplayText,
    i18n,
    ScaleMode,
    StartSceneConfig,
} from "../../core";
import { BackgroundAssetId } from "../../assets/BackgroundAsset";
import { LobbyListScene } from "../LobbyList/lobby-list.scene";
import { PopupInput } from "./objects/LoginPopup";
import { UserRepository } from "./repositories/user.repository";
import { SceneAssetId } from "../../assets/ScenesAsset";
import { MiscAsset, MiscAssetId, MusicAsset, MusicAssetId } from "../../assets";

export class MainMenu extends BaseScene {
    private playButton!: Button;
    private registerButton!: Button;
    private logginButton!: Button;

    constructor() {
        super(SceneAssetId.MENU, BackgroundAssetId.MAIN_MENU, {
            division: { vertical: 7, horizontal: 5 },
        });
        i18n.loadBase();
        const user = localStorage.getItem("user");
        if (user) {
            global.user = JSON.parse(user);
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
        ).setText("Fields Of Fire");

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
        ).setIsActivated(Boolean(global.user));

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
                    console.log("Paramètres - À implémenter");
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
                    global.user?.username ??
                    i18n.translate("mainMenu.register"),
                image: MiscAsset.getAssetKey(MiscAssetId.BUTTON),
                onClick: () => {
                    new PopupInput(this, {
                        title: i18n.translate("mainMenu.register"),
                        placeholder: "Entrez votre pseudo...",
                        onValidate: async (value: string) => {
                            await new UserRepository().register(value);
                            console.log("globo : ", global.user)
                            if (global.user) {
                                this.playButton.alpha = 1;
                                this.registerButton.setIsActivated(false);
                                console.log("register globo : ", global.user.username)
                                this.registerButton.displayText(
                                    global.user.username,
                                );
                                localStorage.setItem(
                                    "user",
                                    JSON.stringify(global.user),
                                );
                                this.updateLoginButtons();
                                return true;
                            }
                            return false;
                        },
                    });
                },
            },
        ).setIsActivated(!global.user);

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
                text: global.user
                    ? i18n.translate("mainMenu.disconnect")
                    : i18n.translate("mainMenu.login"),
                image: MiscAsset.getAssetKey(MiscAssetId.BUTTON),
                onClick: () => {
                    if (global.user) {
                        localStorage.removeItem("user");
                        global.user = undefined;
                    } else {
                        new PopupInput(this, {
                            title: i18n.translate("mainMenu.login"),
                            placeholder: "Entrez votre pseudo...",
                            onValidate: async (value: string) => {
                                await new UserRepository().authenticate(value);
                                console.log(" authent globo : ", global.user)
                                if (global.user) {
                                    this.playButton.alpha = 1;
                                    this.registerButton.setIsActivated(false);
                                    this.registerButton.displayText(
                                        global.user.username,
                                    );
                                    console.log(" authent globo : ", global.user.username)
                                    localStorage.setItem(
                                        "user",
                                        JSON.stringify(global.user),
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
    }

    updateLoginButtons() {
        this.logginButton.displayText(
            global.user
                ? i18n.translate("mainMenu.disconnect")
                : i18n.translate("mainMenu.login"),
        );
        this.registerButton.displayText(
            global.user?.username ?? i18n.translate("mainMenu.register"),
        );
        this.registerButton.setIsActivated(!global.user);
        this.playButton.setIsActivated(Boolean(global.user));
    }
}

