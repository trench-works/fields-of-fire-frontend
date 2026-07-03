import { MiscAsset, MiscAssetId } from "../../assets";
import { BackgroundAssetId } from "../../assets/BackgroundAsset";
import { SceneAssetId } from "../../assets/ScenesAsset";
import { Color } from "../../config/ColorConfig";
import { BaseScene, Button, DisplayContainer, DisplayText, GridArea, i18n, ScaleMode, StartSceneConfig } from "../../core";
import { DisplayImage } from "../../core/UI/DisplayImage";
import { MainMenu } from "../MainMenu/main-menu.scene";

export class ParameterScene extends BaseScene {

    private languageButtons: Map<string, Button> = new Map();
    private currentLanguage: string = i18n.getCurrentLanguage(); 
    private sceneTitle!: DisplayText;
    private LanguageTitle !: DisplayText;
    private returnButton!: Button;
    private test!: DisplayImage;

    static start(scene: BaseScene, config?: StartSceneConfig | undefined) {
        super.startScene(scene, SceneAssetId.PARAMETER, {
            data: null,
            config,
        });
    }

    constructor() {
        super(SceneAssetId.PARAMETER, BackgroundAssetId.LOBBY);
    }

    preload() {
        super.preload();
        MiscAsset.load(this.load, MiscAssetId.BUTTON);
        MiscAsset.load(this.load, MiscAssetId.BUTTON_BLEU);
    }

    create() {
        super.create();
        console.log ("Start Current language: ", this.currentLanguage);
        //Title
        this.sceneTitle = new DisplayText(
            this,
            this.rootGrid.getArea({
                x: 3,
                y: 1,
                width: 5,
                height: 1,
                margin: {top : 10, bottom:0, left: 0, right: 0}
            }),
        ).setText(i18n.translate("parameter.parameter"));

        //Button to return to the main menu
        this.returnButton = new Button(
            this,
            this.rootGrid.getArea({
                    x: 1,
                    y: 1,
                    width: 1,
                    height: 1,
                    margin: {left: 5 *this.scale.width / 100, right : 0, top: 0, bottom: 0},
                })
                .scaleFromCenter(
                    MiscAsset.getAssetScale(MiscAssetId.BUTTON),
                    ScaleMode.CONSERVE,
                ),
            {
                text: i18n.translate("parameter.return"),
                image: MiscAsset.getAssetKey(MiscAssetId.BUTTON),
                onClick: () => {
                    MainMenu.start(this);
                },
            },
        )

        //language selection
        this.languageSelection();
    }

    languageSelection() {
        const languageArea = this.rootGrid.getArea({
            x: 2,
            y: 3,
            width: 7,
            height: 1,
        })

        const languageGrid = languageArea.getGrid({
            division: { vertical: 4, horizontal: 12},
        });

        new DisplayContainer(
            this,
            languageArea,
            {
                borderWidth: 6,
                opacity: 0.25,
            }
        );

        new DisplayContainer(
            this,
            languageGrid.getArea({
                x: 1,
                y: 1,
                width: 12,
                height: 1,
            }),
            {
                borderWidth: 2,
                opacity:1,
                bgColor: Color.btnBorder,
                outterRadius: {tr: 10, tl: 10, bl: 0, br: 0},
            }
        );

        this.LanguageTitle = new DisplayText(
            this,
            languageGrid.getArea({
                x: 5,
                y: 1,
                width: 4,
                height: 1,
            }),
        ).setText(i18n.translate("parameter.languageTitle"));

        const frenchButton = this.languageButton(
            "Français",
            languageGrid.getArea({
                x: 2,
                y: 3,
                width: 2,
                height: 1,
                margin: {top: 0, bottom: 0, left: 0, right: 0}
            }),
            "fr"
        );
        this.languageButtons.set("fr", frenchButton);

        const EnglishButton = this.languageButton(
            "English",
            languageGrid.getArea({
                x: 4,
                y: 3,
                width: 2,
                height: 1,
                margin: {top: 0, bottom: 0, left: 0, right: 0}
            }),
            "en"
        );
        this.languageButtons.set("en", EnglishButton);

        const JapaneseButton = this.languageButton(
            "日本語",
            languageGrid.getArea({
                x: 6,
                y: 3,
                width: 2,
                height: 1,
                margin: {top: 0, bottom: 0, left: 0, right: 0}
            }),
            "ja"
        );
        this.languageButtons.set("ja", JapaneseButton);

        const RussianButton = this.languageButton(
            "Русский",
            languageGrid.getArea({
                x: 8,
                y: 3,
                width: 2,
                height: 1,
                margin: {top: 0, bottom: 0, left: 0, right: 0}
            }),
            "ru"
        );
        this.languageButtons.set("ru", RussianButton);

        const ChineseButton = this.languageButton(
            "中文",
            languageGrid.getArea({
                x: 10,
                y: 3,
                width: 2,
                height: 1,
                margin: {top: 0, bottom: 0, left: 0, right: 0}
            }),
            "zh"
        );
        this.languageButtons.set("zh", ChineseButton);

        this.updateLanguageButtons();
    }


    languageButton(title : string, gridArea : GridArea, lang : string) {
        return new Button(
            this,
            gridArea.scaleFromCenter(
                    MiscAsset.getAssetScale(MiscAssetId.BUTTON),
                    ScaleMode.CONSERVE,
                ),
            {
                text: title,
                onClick: () => {
                    i18n.load(lang);
                    this.currentLanguage = lang;
                    this.updateLanguageButtons();
                },
                image: MiscAsset.getAssetKey(MiscAssetId.BUTTON),
            },
        );
    }

    updateLanguageButtons() {
        console.log("Buttn List: ", this.languageButtons);
        this.languageButtons.forEach((button, lang) => {
            button.setImage(
                lang === this.currentLanguage
                    ? MiscAsset.getAssetKey(MiscAssetId.BUTTON_BLEU)
                    : MiscAsset.getAssetKey(MiscAssetId.BUTTON)
            );
        });
        this.sceneTitle.setText(i18n.translate("parameter.parameter"));
        this.LanguageTitle.setText(i18n.translate("parameter.languageTitle"));
        this.returnButton.setText(i18n.translate("parameter.return"));
    }
}