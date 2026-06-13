import Phaser from "phaser";
import { BaseScene, Button, DisplayText, ScaleMode } from "../../core";
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
        const user = localStorage.getItem("user");
        if (user) {
            global.user = JSON.parse(user);
        }
    }

    static start(scene: Phaser.Scene) {
        scene.scene.start(SceneAssetId.MENU);
    }

    preload() {
        super.preload();
        MiscAsset.load(this.load, MiscAssetId.BUTTON);
        MusicAsset.load(this.load, MusicAssetId.MENU);
    }

    init() {
        this.sound.unlock();
    }

    create() {
        const backgroundSound = this.sound.add(
            MusicAsset.getAssetKey(MusicAssetId.MENU),
        );
        backgroundSound.setLoop(true);
        backgroundSound.play();
        this.sound.unlock();
        super.create();
        // Créer un titre du menu
        const titleBox = this.rootGrid.getArea({
            x: 1,
            y: 2,
            width: 5,
            height: 1,
        });
        new DisplayText(this, titleBox).setText("Les Mémoires Oubliées");

        // Créer une grille interne pour les boutons (3 boutons: 1 colonne, 3 lignes)
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
                text: "Jouer",
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
                text: "Paramètres",
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
                text: global.user?.username ?? "Register",
                image: MiscAsset.getAssetKey(MiscAssetId.BUTTON),
                onClick: () => {
                    new PopupInput(this, {
                        title: "S'enregistrer",
                        placeholder: "Entrez votre pseudo...",
                        onValidate: async (value: string) => {
                            await new UserRepository().authenticate(value);
                            if (global.user) {
                                this.playButton.alpha = 1;
                                this.registerButton.setIsActivated(false);
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
                text: global.user ? "Disconnect" : "Login",
                image: MiscAsset.getAssetKey(MiscAssetId.BUTTON),
                onClick: () => {
                    if (global.user) {
                        localStorage.removeItem("user");
                        global.user = undefined;
                    } else {
                        new PopupInput(this, {
                            title: "Connexion",
                            placeholder: "Entrez votre pseudo...",
                            onValidate: async (value: string) => {
                                await new UserRepository().authenticate(value);
                                if (global.user) {
                                    this.playButton.alpha = 1;
                                    this.registerButton.setIsActivated(false);
                                    this.registerButton.displayText(
                                        global.user.username,
                                    );
                                    localStorage.setItem(
                                        "user",
                                        JSON.stringify(global.user),
                                    );
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
        this.logginButton.displayText(global.user ? "Disconnect" : "Login");
        this.registerButton.displayText(global.user?.username ?? "Register");
        this.registerButton.setIsActivated(!global.user);
    }
}

