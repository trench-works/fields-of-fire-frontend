import Phaser from "phaser";
import { BaseScene, Button, DisplayText } from "../../core";
import { BackgroundAssetId } from "../../assets/BackgroundAsset";
import { LobbyListScene } from "../LobbyList/lobby-list.scene";
import { PopupInput } from "./objects/LoginPopup";
import { UserRepository } from "./repositories/user.repository";
import { SceneAssetId } from "../../assets/ScenesAsset";
import { MiscAsset, MiscAssetId } from "../../assets";

export class MainMenu extends BaseScene {
    private playButton!: Button;
    private connectButton!: Button;

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
    }

    create() {
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
        const playArea = buttonsGrid.getArea({
            x: 1,
            y: 1,
            width: 1,
            height: 1,
        });
        this.playButton = new Button(this, {
            text: "Jouer",
            x: playArea.center.x,
            y: playArea.center.y,
            width:
                playArea.height * MiscAsset.getAssetScale(MiscAssetId.BUTTON),
            height: playArea.height,
            image: MiscAsset.getAssetKey(MiscAssetId.BUTTON),
            onClick: () => {
                LobbyListScene.start(this);
            },
        }).setIsActivated(Boolean(global.user));

        // Bouton Paramètres (ligne 1)
        const settingsArea = buttonsGrid.getArea({
            x: 1,
            y: 2,
            width: 1,
            height: 1,
        });
        new Button(this, {
            text: "Paramètres",
            x: settingsArea.center.x,
            y: settingsArea.center.y,
            width:
                playArea.height * MiscAsset.getAssetScale(MiscAssetId.BUTTON),
            height: settingsArea.height,
            image: MiscAsset.getAssetKey(MiscAssetId.BUTTON),
            onClick: () => {
                console.log("Paramètres - À implémenter");
            },
        });

        //bouton login
        const loginArea = this.rootGrid.getArea({
            x: 5,
            y: 1,
            width: 1,
            height: 1,
            margin: 20,
        });
        this.connectButton = new Button(this, {
            text: global.user?.username ?? "Login",
            x: loginArea.center.x,
            y: loginArea.center.y,
            width: loginArea.width,
            height:
                loginArea.width / MiscAsset.getAssetScale(MiscAssetId.BUTTON),
            image: MiscAsset.getAssetKey(MiscAssetId.BUTTON),
            onClick: () => {
                new PopupInput(this, {
                    title: "Connexion",
                    placeholder: "Entrez votre pseudo...",
                    onValidate: async (value: string) => {
                        await new UserRepository().authenticate(value);
                        if (global.user) {
                            this.playButton.alpha = 1;
                            this.connectButton.setIsActivated(false);
                            this.connectButton.displayText(
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
            },
        }).setIsActivated(!global.user);
    }
}

