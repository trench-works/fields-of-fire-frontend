import { ActionAsset, ActionAssetId } from "../../../assets/ActionAsset";
import { Color } from "../../../config/ColorConfig";
import { DisplayContainer, List, Button, ScaleMode } from "../../../core";
import { Action } from "../../../Model/Action";
import { FightScene } from "../fight.scene";
import { GameStore } from "../stores/GameStore";
import { PlayerStore } from "../stores/PlayerStore";
import { FightSceneDisplayer } from "./FightSceneDisplayer";

export class ActionDisplayer extends FightSceneDisplayer {
    /**
     * Displayed Elements
     */
    protected actionElements: Map<string, Button> = new Map();
    protected endTurnButton!: Button;
    protected actionsList!: List;

    protected lockLevel: number;

    constructor(
        scene: FightScene,
        gameStore: GameStore,
        private readonly playerStore: PlayerStore,
    ) {
        super(scene, gameStore);
        this.lockLevel = 0;
    }

    protected handleActionClick(action: Action) {
        const isPlayerTurn =
            this.gameStore.game.playerTurns[0] ===
            this.playerStore.playerEntity.entityId;
        const hasMovement = this.playerStore.playerEntity.stats.mouvement > 0;
        const hasEnergy = this.playerStore.playerEntity.stats.energy > 0;
        if (!isPlayerTurn) {
            return;
        }
        this.scene.rangeVisualizer.clearRange();
        switch (action.id) {
            case ActionAssetId.WALK:
                if (!hasMovement) {
                    return;
                }
                this.scene.rangeVisualizer.getCellsInMoveRange(
                    this.playerStore.playerEntity.position,
                    this.playerStore.playerEntity.stats.mouvement,
                );
                break;
            default:
                if (!hasEnergy) {
                    return;
                }
                this.scene.rangeVisualizer.getCellsInAttackRange(
                    this.playerStore.playerEntity.position,
                    action.range ?? 0,
                );
                break;
        }

        this.scene.rangeVisualizer.showRange();
        this.scene.actionManager.currentAction = action;
    }

    preRender(): this {
        const actionArea = this.scene.rootGrid.getArea({
            x: 3,
            y: 9,
            width: 5,
            height: 1,
        });

        new DisplayContainer(this.scene, actionArea, {
            borderWidth: 7,
            opacity: 0.5,
            outterRadius: { tl: 0, bl: 0, tr: 10, br: 10 },
        });

        const actionGrid = actionArea.getGrid({
            division: { vertical: 1, horizontal: 9 },
            margin: { vertical: 20, horizontal: 10 },
        });
        const actionListGrid = actionGrid.getSubGrid(
            {
                x: 1,
                y: 1,
                width: 7,
                height: 1,
            },
            {
                division: {
                    horizontal: 9,
                    vertical: 1,
                },
                padding: 5,
            },
        );

        this.actionsList = new List(this.scene, actionListGrid);

        this.endTurnButton = new Button(
            this.scene,
            actionGrid.getArea({
                x: 8,
                y: 1,
                width: 2,
                height: 1,
            }),
            {
                text: "Fin du tour",
                borderColor: Color.containerBorder,
                borderWidth: 2,
                onClick: () => {},
            },
        ).setIsActivated(false);

        return this;
    }

    render(): this {
        this.playerStore.playerClass.actionList.forEach((action, index) => {
            const iconObj = this.actionsList.placeElement(
                { x: index, y: 0 },
                (area) => {
                    return new Button(
                        this.scene,
                        area.scaleFromCenter(
                            ActionAsset.getAssetScale(action.id),
                            ScaleMode.FIT,
                        ),
                        {
                            image: ActionAsset.getAssetKey(action.id),
                            onClick: () => this.handleActionClick(action),
                        },
                    );
                },
            );
            if (iconObj) {
                this.scene.tooltip.attachTo(iconObj, action.name ?? action.id);
                this.actionElements.set(action.id, iconObj);
            }
        });

        this.endTurnButton
            .setOnClick(() => {
                this.scene.finishTurn();
            })
            .setIsActivated(true);

        return this;
    }

    update(): this {
        const isPlayerTurn =
            this.gameStore.game.playerTurns[0] ===
            this.playerStore.playerEntity.entityId;

        this.playerStore.playerClass.actionList.forEach((action) => {
            const actionObject = this.actionElements.get(action.id)!;
            switch (action.id) {
                case ActionAssetId.WALK:
                    {
                        const hasMovement =
                            this.playerStore.playerEntity.stats.mouvement > 0;
                        actionObject.setIsActivated(
                            isPlayerTurn && hasMovement,
                        );
                    }
                    break;
                default:
                    {
                        const hasEnoughEnergy =
                            this.playerStore.playerEntity.stats.energy >=
                            action.cost;
                        actionObject.setIsActivated(
                            isPlayerTurn && hasEnoughEnergy,
                        );
                    }
                    break;
            }
        });
        this.endTurnButton.setIsActivated(isPlayerTurn);
        return this;
    }

    async animate(): Promise<this> {
        return this;
    }

    lock() {
        if (this.lockLevel === 0) {
            this.actionElements.forEach((action) => {
                action.setIsActivated(false);
            });
            this.endTurnButton.setIsActivated(false);
        }
        this.lockLevel++;
    }

    unlock() {
        if (this.lockLevel > 0) {
            this.lockLevel--;
            if (this.lockLevel === 0) {
                this.update();
            }
        }
    }
}

