import { CharacterCloseupAsset } from "../../../assets";
import { Color } from "../../../config/ColorConfig";
import { CustomContainer, ScaleUtils } from "../../../core";
import { FightScene } from "../fight.scene";
import { ClassStore } from "../stores/ClassStore";
import { GameStore } from "../stores/GameStore";
import { FightSceneDisplayer } from "./FightSceneDisplayer";

export class TurnDisplayer extends FightSceneDisplayer {
    private turnPanel!: CustomContainer;

    private icons: CustomContainer[] = [];

    constructor(
        scene: FightScene,
        gameStore: GameStore,
        private readonly classStore: ClassStore,
    ) {
        super(scene, gameStore);
    }

    preRender(): this {
        const turndisplay = this.scene.rootGrid.getArea({
            x: 1,
            y: 1,
            width: 7,
            height: 1,
        });
        this.turnPanel = new CustomContainer(this.scene, {
            x: turndisplay.center.x,
            y: turndisplay.center.y,
            width: turndisplay.width,
            height: turndisplay.height,
            opacity: 0.25,
        });

        this.turnPanel.setDepth(0);

        return this;
    }

    render(): this {
        const turnGrid = this.scene.rootGrid.getSubGrid(
            {
                x: 1,
                y: 1,
                width: 7,
                height: 1,
                margin: 10,
            },
            {
                division: {
                    horizontal: 10,
                    vertical: 1,
                },
            },
        );

        this.gameStore.game.playerTurns.forEach((entityId, index) => {
            const entity = this.gameStore.game.entities.find(
                (entity) => entity.entityId === entityId,
            )!;
            const player = this.gameStore.game.players.find(
                (player) => player.entityId === entityId,
            );
            const charClass = this.classStore.classes.find(
                (charClass) => charClass.id === entity?.classId,
            );
            const isFirstCell = index === 0;

            const cellArea = turnGrid.getArea({
                x: index + 1,
                y: 1,
                width: 1,
                height: 1,
                margin: isFirstCell ? 0 : 5,
            });

            const imageSize = ScaleUtils.fitFromScale(
                cellArea,
                CharacterCloseupAsset.getAssetScale(entity.classId),
            );

            this.icons.push(
                new CustomContainer(this.scene, {
                    title: player?.name ?? charClass?.name?.split(" ")[0],
                    x: cellArea.center.x,
                    y: cellArea.center.y,
                    width: imageSize.width,
                    height: imageSize.height,
                    borderWidth: isFirstCell ? 5 : 2,
                    borderColor: isFirstCell
                        ? Color.actualTurnBorder
                        : Color.otherTurnBorder,
                    backgroundImage: CharacterCloseupAsset.getAssetKey(
                        entity.classId,
                    ),
                    opacity: isFirstCell ? 1 : 0.7,
                }),
            );
        });
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

