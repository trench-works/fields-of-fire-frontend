import { MiscAsset, MiscAssetId } from "../../assets";
import { BackgroundAssetId } from "../../assets/BackgroundAsset";
import { SceneAssetId } from "../../assets/ScenesAsset";
import { Color } from "../../config/ColorConfig";
import {
    BaseScene,
    Button,
    DisplayContainer,
    DisplayText,
    GridArea,
    i18n,
    ScaleMode,
    SoundLevel,
    StartSceneConfig,
} from "../../core";
import { DisplayImage } from "../../core/UI/DisplayImage";
import { SoundParam } from "../../core/Utils/SoundLevel";
import { MainMenu } from "../MainMenu/main-menu.scene";
import { SoundBar } from "./objects/SoundBar";

export class ParameterScene extends BaseScene {
    private languageButtons: Map<string, Button> = new Map();
    private currentLanguage: string = i18n.getCurrentLanguage();
    private sceneTitle!: DisplayText;
    private LanguageTitle!: DisplayText;
    private returnButton!: Button;
    private soundTitle!: DisplayText;
    private test!: DisplayImage;
    private MusicSoundBar!: SoundBar;
    private SFXSoundBar!: SoundBar;

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
        MiscAsset.load(this.load, MiscAssetId.BUTTON_BLUE);
        MiscAsset.load(this.load, MiscAssetId.BUTTON_ROUND);
    }

    create() {
        super.create();
        //Title
        this.sceneTitle = new DisplayText(
            this,
            this.rootGrid.getArea({
                x: 3,
                y: 1,
                width: 5,
                height: 1,
                margin: { top: 10, bottom: 0, left: 0, right: 0 },
            }),
        ).setText(i18n.translate("parameter.parameter"));

        //Button to return to the main menu
        this.returnButton = new Button(
            this,
            this.rootGrid
                .getArea({
                    x: 1,
                    y: 1,
                    width: 1,
                    height: 1,
                    margin: {
                        left: (5 * this.scale.width) / 100,
                        right: 0,
                        top: 0,
                        bottom: 0,
                    },
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
        );

        //language selection
        this.languageSelection();
        //
        this.soundParameter();

        this.updateLanguageButtons();
    }

    subParameterContainer(y: number, ContainerHeight: number) {
        const paramArea = this.rootGrid.getArea({
            x: 2,
            y: y,
            width: 7,
            height: ContainerHeight,
        });

        const paramGrid = paramArea.getGrid({
            division: { vertical: 4, horizontal: 12 },
        });

        new DisplayContainer(this, paramArea, {
            borderWidth: 6,
            opacity: 0.25,
        });

        new DisplayContainer(
            this,
            paramGrid.getArea({
                x: 1,
                y: 1,
                width: 12,
                height: 1,
            }),
            {
                borderWidth: 2,
                opacity: 1,
                bgColor: Color.MILITARY_GREEN,
                outterRadius: { tr: 10, tl: 10, bl: 0, br: 0 },
            },
        );

        return paramGrid;
    }

    languageSelection() {
        const languageGrid = this.subParameterContainer(2, 1.5);

        this.LanguageTitle = new DisplayText(
            this,
            languageGrid.getArea({
                x: 5,
                y: 1,
                width: 4,
                height: 1,
            }),
        ).setText(i18n.translate("parameter.languageTitle"));

        let i = 1;
        for (const [code, title] of Object.entries(i18n.AvailableLanguages)) {
            const languageButton = this.languageButton(
                title,
                languageGrid.getArea({
                    x: i * 2,
                    y: 3,
                    width: 2,
                    height: 1,
                    margin: { top: 0, bottom: 0, left: 0, right: 0 },
                }),
                code,
            );
            this.languageButtons.set(code, languageButton);
            i++;
        }
    }

    languageButton(title: string, gridArea: GridArea, lang: string) {
        return new Button(
            this,
            gridArea.scaleFromCenter(
                MiscAsset.getAssetScale(MiscAssetId.BUTTON),
                ScaleMode.CONSERVE,
            ),
            {
                text: title,
                onClick: () => {
                    i18n.changeLanguage(lang);
                    this.currentLanguage = lang;
                    this.updateLanguageButtons();
                },
                image: MiscAsset.getAssetKey(MiscAssetId.BUTTON),
            },
        );
    }

    soundParameter() {
        const soundGrid = this.subParameterContainer(4, 2);

        this.soundTitle = new DisplayText(
            this,
            soundGrid.getArea({
                x: 5,
                y: 1,
                width: 4,
                height: 1,
            }),
        ).setText(i18n.translate("parameter.soundTitle"));

        this.MusicSoundBar = new SoundBar(
            this,
            soundGrid,
            2.25,
            "parameter.sound.music",
            SoundLevel.get(SoundParam.BACKGROUND) * 10,
            (volume: number) => {
                SoundLevel.set(SoundParam.BACKGROUND, volume);
                this.sound.setVolume(volume);
            },
        );
        this.SFXSoundBar = new SoundBar(
            this,
            soundGrid,
            3.5,
            "parameter.sound.effects",
            SoundLevel.get(SoundParam.EFFECT) * 10,
            (volume: number) => {
                SoundLevel.set(SoundParam.EFFECT, volume);
            },
        );
    }

    updateLanguageButtons() {
        this.languageButtons.forEach((button, lang) => {
            button.setImage(
                lang === this.currentLanguage
                    ? MiscAsset.getAssetKey(MiscAssetId.BUTTON_BLUE)
                    : MiscAsset.getAssetKey(MiscAssetId.BUTTON),
            );
        });
        this.sceneTitle.setText(i18n.translate("parameter.parameter"));
        this.LanguageTitle.setText(i18n.translate("parameter.languageTitle"));
        this.soundTitle.setText(i18n.translate("parameter.soundTitle"));
        this.returnButton.setText(i18n.translate("parameter.return"));
    }
}

