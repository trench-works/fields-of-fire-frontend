import { CharacterCloseupAsset } from "../../../assets";
import { Color } from "../../../config/ColorConfig";
import {
    Depth,
    DisplayContainer,
    ScaleMode,
    UI_LEVELS_OFFSET,
} from "../../../core";
import { translate } from "../../../core/i18n/i18n";
import { FightScene } from "../fight.scene";
import { ClassStore } from "../stores/class.store";
import { GameStore } from "../stores/game.store";
import { FightSceneDisplayer } from "./base/fight-scene.displayer";

export class TurnDisplayer extends FightSceneDisplayer {
    private turnPanel!: DisplayContainer;
    private roundPanel!: DisplayContainer;

    private icons: DisplayContainer[] = [];

    constructor(
        scene: FightScene,
        gameStore: GameStore,
        private readonly classStore: ClassStore,
    ) {
        super(scene, gameStore);
    }

    preRender(): this {
        this.turnPanel = new DisplayContainer(
            this.scene,
            this.scene.rootGrid.getArea({
                x: 1,
                y: 1,
                width: 7,
                height: 1,
            }),
            {
                opacity: 0.25,
                outterRadius: { tr: 0, bl: 0, tl: 0, br: 10 },
            },
        ).setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.CONTAINER));
        this.roundPanel = new DisplayContainer(
            this.scene,
            this.scene.rootGrid.getArea({
                x: 1,
                y: 2,
                width: 1,
                height: 0.4,
            }),
            {
                opacity: 0.25,
                outterRadius: { tr: 0, bl: 0, tl: 0, br: 10 },
            },
        ).setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.CONTAINER));

        return this;
    }

    render(): this {
        const turnGrid = this.scene.rootGrid.getSubGrid(
            {
                x: 1,
                y: 1,
                width: 7,
                height: 1,
                margin: 5,
            },
            {
                division: {
                    horizontal: 14,
                    vertical: 1,
                },
                padding: 5,
            },
        );

        this.gameStore.game.playerTurns.forEach((entityId, index) => {
            const entity = this.gameStore.game.entities.find(
                (entity) => entity.id === entityId,
            )!;
            const player = this.gameStore.game.players.find(
                (player) => player.entityId === entityId,
            );
            const charClass = this.classStore.classes.find(
                (charClass) => charClass.id === entity?.classId,
            );
            const isFirstCell = index === 0;

            const cellArea = turnGrid
                .getArea({
                    x: index + 1,
                    y: 1,
                    width: 1,
                    height: 1,
                    margin: isFirstCell ? 0 : 5,
                })
                .scaleFromCenter(
                    CharacterCloseupAsset.getAssetScale(entity.classId),
                    ScaleMode.FIT,
                );

            this.icons.push(
                new DisplayContainer(
                    this.scene,
                    {
                        ...cellArea,
                        y: cellArea.y - (isFirstCell ? 0 : 5),
                    },
                    {
                        title: player?.name ?? charClass?.name?.split(" ")[0],
                        borderWidth: isFirstCell ? 5 : 2,
                        borderColor: isFirstCell
                            ? Color.CURRENT_TURN_BORDER
                            : Color.TURN_BORDER,
                        backgroundImage: CharacterCloseupAsset.getAssetKey(
                            entity.classId,
                        ),
                        opacity: isFirstCell ? 1 : 0.7,
                        onClick: () => {
                            this.scene.root.controllers.game.inspectCharacter(
                                entityId,
                            );
                        },
                    },
                ).setDepth(
                    Depth.getUIElementDepth(UI_LEVELS_OFFSET.CONTAINER) + 1,
                ),
            );
        });

        this.roundPanel.setText(
            `${translate("fight.ui.round")} : ${this.gameStore.game.round}`,
        );
        return this;
    }

    update(): this {
        this.icons.forEach((icon) => icon.destroy());
        this.icons = [];
        return this.render();
    }

    async animate(): Promise<this> {
        return this;
    }
}

