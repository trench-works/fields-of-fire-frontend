import Phaser from "phaser";
import { BaseScene, Button, CustomContainer, Grid } from "../../core";
import { BackgroundAssetId } from "../../assets/BackgroundAsset";
import { LobbyListScene } from "../LobbyList/lobby-list.scene";
import { PopupInput } from "./objects/LoginPopup";
import { UserRepository } from "./repositories/user.repository";
import { SceneAssetId } from "../../assets/ScenesAsset";
import { MiscAsset, MiscAssetId } from "../../assets";

export class MainMenu extends BaseScene {
    private readonly BUTTON_WIDTH = 400;
    private readonly BUTTON_HEIGHT = 400 * (50 / 180);
    private sceneGrid = new Grid();

    private playButton!: CustomContainer;
    private connectButton!: Button;

    constructor() {
        super(SceneAssetId.MENU, BackgroundAssetId.MAIN_MENU);
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
        this.add
            .text(this.scale.width / 2, 200, "Les Mémoires Oubliées", {
                fontFamily: "MyFont",
                fontSize: "48px",
                color: "#FFFFFF",
            })
            .setOrigin(0.5);

        // Zone des boutons (centrer verticalement: colonne 2-7, ligne 3-6)
        const buttonsArea = this.sceneGrid.getArea({
            x: 4.5,
            y: 3,
            width: 0,
            height: 15,
        });

        // Créer une grille interne pour les boutons (3 boutons: 1 colonne, 3 lignes)
        const buttonsGrid = new Grid({
            size: { width: buttonsArea.width, height: buttonsArea.height },
        });

        // Bouton Jouer (ligne 0)
        const playArea = buttonsGrid.getArea({
            x: 0,
            y: 0,
            width: 1,
            height: 1,
        });
        this.playButton = new CustomContainer(this, {
            title: "Jouer",
            x: buttonsArea.x + playArea.center.x,
            y: buttonsArea.y + playArea.center.y,
            width: this.BUTTON_WIDTH,
            height: this.BUTTON_HEIGHT,
            backgroundImage: MiscAsset.getAssetKey(MiscAssetId.BUTTON),
            titleColor: "#FFFFFF",
            fontSize: 40,
            alpha: global.user ? 1 : 0.5,
            textPosition: { x: -130, y: -10 },
            hoverTint: 0xcccccc,
            onClick: () => {
                if (global.user) {
                    LobbyListScene.start(this);
                }
            },
        });

        // Bouton Paramètres (ligne 1)
        const settingsArea = buttonsGrid.getArea({
            x: 0,
            y: 1,
            width: 1,
            height: 1,
        });
        new CustomContainer(this, {
            title: "Paramètres",
            x: buttonsArea.x + settingsArea.center.x,
            y: buttonsArea.y + settingsArea.center.y,
            width: this.BUTTON_WIDTH,
            height: this.BUTTON_HEIGHT,
            backgroundImage: MiscAsset.getAssetKey(MiscAssetId.BUTTON),
            titleColor: "#FFFFFF",
            fontSize: 40,
            textPosition: { x: -70, y: -10 },
            hoverTint: 0xcccccc,
            onClick: () => {
                console.log("Paramètres - À implémenter");
            },
        });

        //bouton login
        const loginArea = this.sceneGrid.getArea({
            x: 8,
            y: 0,
            width: 1,
            height: 1,
        });
        new CustomContainer(this, {
            title: global.user?.username ?? "Login",
            x: loginArea.x + loginArea.width / 2,
            y: loginArea.y + loginArea.height / 2,
            width: 360,
            height: 100,
            backgroundImage: MiscAsset.getAssetKey(MiscAssetId.BUTTON),
            titleColor: "#FFFFFF",
            fontSize: 40,
            textPosition: { x: -70, y: -10 },
            hoverTint: 0xcccccc,
            onClick: global.user
                ? undefined
                : () => {
                      new PopupInput(this, {
                          title: "Connexion",
                          placeholder: "Entrez votre pseudo...",
                          onValidate: async (value: string) => {
                              await new UserRepository().authenticate(value);
                              if (global.user) {
                                  this.playButton.alpha = 1;
                                  this.connectButton.onClick = undefined;
                                  this.connectButton.setText(
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
        });
    }
}

