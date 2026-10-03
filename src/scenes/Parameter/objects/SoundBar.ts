import { MiscAsset, MiscAssetId } from "../../../assets";
import { Color } from "../../../config/ColorConfig";
import {
    DisplayText,
    i18n,
    DisplayContainer,
    Button,
    Grid,
    BaseScene,
    ScaleMode,
    GridArea,
} from "../../../core";
import { TranslationKey } from "../../../core/i18n/i18n";

export class SoundBar {
    protected scene: BaseScene;
    protected gaugeArea: GridArea;
    protected gaugeContainer: DisplayContainer;

    constructor(
        scene: BaseScene,
        grid: Grid, // le paramGrid retourné par subParameterContainer
        row: number,
        labelKey: TranslationKey,
        initialVolume: number,
        onChange: (volume: number) => void,
    ) {
        this.scene = scene;

        const rowGrid = grid.getSubGrid(
            { x: 0.5, y: row, width: 12, height: 1 },
            { division: { horizontal: 12, vertical: 1 } },
        );

        // Label
        new DisplayText(
            this.scene,
            rowGrid.getArea({ x: 1, y: 1, width: 3, height: 0.75 }),
        ).setText(i18n.translate(labelKey));

        // Jauge (affichage visuel)
        let volume = initialVolume; // 0 à 10
        const steps = 10; // nombre d'étapes de volume
        this.gaugeArea = rowGrid.getArea({
            x: 4,
            y: 1.25,
            width: 9,
            height: 0.5,
        });

        //contour de la barre de volume
        new DisplayContainer(this.scene, this.gaugeArea, {
            bgColor: Color.MILITARY_SAND,
            borderWidth: 3,
            opacity: 0,
        });

        this.gaugeArea = rowGrid.getArea({
            x: 4,
            y: 1.25,
            width: volume * 0.9,
            height: 0.5,
            margin: { top: 1, bottom: 1, left: 0, right: 0 },
        });

        this.gaugeContainer = new DisplayContainer(this.scene, this.gaugeArea, {
            bgColor: Color.SOUND_BAR,
            opacity: 1,
        });

        const updateGauge = () => {
            this.gaugeContainer.destroy();
            if (volume <= 0) return; // ne pas afficher la jauge si le volume est à 0
            this.gaugeArea = rowGrid.getArea({
                x: 4,
                y: 1.25,
                width: volume * 0.9,
                height: 0.5,
                margin: { top: 1, bottom: 1, left: 0, right: 0 },
            });
            this.gaugeContainer = new DisplayContainer(
                this.scene,
                this.gaugeArea,
                {
                    bgColor: Color.SOUND_BAR,
                    opacity: 1,
                },
            );
        };

        // Bouton -
        new Button(
            this.scene,
            rowGrid
                .getArea({ x: 3.25, y: 1, width: 1, height: 1, margin: 4 })
                .scaleFromCenter(
                    MiscAsset.getAssetScale(MiscAssetId.BUTTON_ROUND),
                    ScaleMode.FIT,
                ),
            {
                text: "-",
                image: MiscAsset.getAssetKey(MiscAssetId.BUTTON_ROUND),
                onClick: () => {
                    if (volume > 0) {
                        volume--;
                        onChange(volume / steps);
                        updateGauge();
                    }
                },
            },
        );

        // Bouton +
        new Button(
            this.scene,
            rowGrid
                .getArea({ x: 12.75, y: 1, width: 1, height: 1, margin: 4 })
                .scaleFromCenter(
                    MiscAsset.getAssetScale(MiscAssetId.BUTTON_ROUND),
                    ScaleMode.FIT,
                ),
            {
                text: "+",
                image: MiscAsset.getAssetKey(MiscAssetId.BUTTON_ROUND),
                onClick: () => {
                    if (volume < steps) {
                        volume++;
                        onChange(volume / steps);
                        updateGauge();
                    }
                },
            },
        );
    }
}
