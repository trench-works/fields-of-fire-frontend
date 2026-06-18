import { ActionAsset, ActionAssetId } from "../../../assets/ActionAsset";
import { Color } from "../../../config/ColorConfig";
import {
    DisplayContainer,
    List,
    Button,
    ScaleMode,
    Blur,
    GridArea,
    DisplayRoot,
} from "../../../core";
import { Action } from "../../../Model/Action";
import { StatsUtils } from "../../../Model/Stats";
import { FightScene } from "../fight.scene";
import { GameStore } from "../stores/GameStore";
import { PlayerStore } from "../stores/PlayerStore";
import { FightSceneDisplayer } from "./FightSceneDisplayer";

export class ActionDisplayer extends FightSceneDisplayer {
    protected actionArea!: GridArea;
    /**
     * Displayed Elements
     */
    protected actionPanel!: DisplayContainer;
    protected actionElements: Map<string, Button> = new Map();
    protected endTurnButton!: Button;
    protected actionsList!: List;

    protected lockLevel: number;

    protected root!: DisplayRoot;

    constructor(
        scene: FightScene,
        gameStore: GameStore,
        private readonly playerStore: PlayerStore,
    ) {
        super(scene, gameStore);
        this.lockLevel = 0;
        this.root = new DisplayRoot();
    }

    clearAction() {
        this.scene.rangeVisualizer.clearRange();
        this.scene.rangeVisualizer.clearZonePreview();
        this.scene.actionManager.clearCurrentAction();
        this.actionElements.forEach((action) => action.hightlight(false));
    }

    protected handleActionClick(action: Action) {
        const isPlayerTurn =
            this.gameStore.game.playerTurns[0] ===
            this.playerStore.playerEntity.entityId;
        const stats = StatsUtils.fromEntity(this.playerStore.playerEntity);
        if (!isPlayerTurn) {
            return;
        }
        this.clearAction();
        switch (action.id) {
            case ActionAssetId.WALK:
                if (!stats.mouvement) {
                    return;
                }
                this.scene.rangeVisualizer.getCellsInMoveRange(
                    this.playerStore.playerEntity.position,
                    stats.mouvement,
                );
                break;
            default:
                if (stats.energy < action.cost) {
                    return;
                }
                this.scene.rangeVisualizer.getCellsInAttackRange(
                    this.playerStore.playerEntity.position,
                    action.range ?? 0,
                );
                break;
        }

        this.scene.rangeVisualizer.showRange();
        this.actionElements.get(action.id)?.hightlight(true);
        this.scene.actionManager.currentAction = action;
    }

    destroy(): this {
        this.root.destroy();
        return this;
    }

    preRender(): this {
        this.actionArea = this.scene.rootGrid.getArea({
            x: 3,
            y: 9,
            width: 5,
            height: 1,
        });

        this.actionPanel = new DisplayContainer(this.scene, this.actionArea, {
            borderWidth: 7,
            opacity: 0.5,
            outterRadius: { tl: 0, bl: 0, tr: 10, br: 10 },
            onClick: () => this.clearAction(),
        });
        this.root.add(this.actionPanel);

        const actionGrid = this.actionArea.getGrid({
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
        this.root.add(this.actionsList);

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
        this.root.add(this.endTurnButton);

        return this;
    }

    render(): this {
        this.playerStore.playerClass.actionList.forEach((action, index) => {
            const iconObj = this.actionsList.placeElement(
                { x: index, y: 0 },
                (area) => {
                    const button = new Button(
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
                    this.root.add(button);
                    return button;
                },
            );
            const actionDesc = `coût: ${action.cost}\naction: ${action.actionType}\nportée: ${action.range}`;
            if (iconObj) {
                this.scene.tooltip.attachTo(
                    iconObj,
                    actionDesc ?? "",
                    action.name ?? action.id,
                );
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

    blurOut(): this {
        new Blur(this.scene, this.actionArea, {
            radius: this.actionPanel.outterRadius,
            depth: 50,
        });
        return this;
    }

    update(): this {
        const isPlayerTurn =
            this.gameStore.game.playerTurns[0] ===
            this.playerStore.playerEntity.entityId;

        const stats = StatsUtils.fromEntity(this.playerStore.playerEntity);

        this.playerStore.playerClass.actionList.forEach((action) => {
            const actionObject = this.actionElements.get(action.id)!;
            switch (action.id) {
                case ActionAssetId.WALK:
                    {
                        actionObject.setIsActivated(
                            isPlayerTurn && stats.mouvement > 0,
                        );
                    }
                    break;
                default:
                    {
                        actionObject.setIsActivated(
                            isPlayerTurn && stats.energy >= action.cost,
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

