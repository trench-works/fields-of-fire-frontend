import { ActionAsset, ActionAssetId } from "../../../assets/ActionAsset";
import { Color } from "../../../config/ColorConfig";
import {
    DisplayContainer,
    List,
    Button,
    ScaleMode,
    GridArea,
    DisplayRoot,
    DisplayText,
    Depth,
    UI_LEVELS_OFFSET,
    i18n,
} from "../../../core";
import { StatsUtils } from "../../../Model/Stats";
import { FightScene } from "../fight.scene";
import { ActionsStore } from "../stores/actions.store";
import { GameStore } from "../stores/game.store";
import { PlayerStore } from "../stores/player.store";
import { FightSceneDisplayer } from "./base/fight-scene.displayer";

export class ActionDisplayer extends FightSceneDisplayer {
    public root: DisplayRoot;
    protected actionArea!: GridArea;
    /**
     * Displayed Elements
     */
    protected actionPanel!: DisplayContainer;
    public actionElements: Map<string, Button> = new Map();
    public endTurnButton!: Button;
    protected actionsList!: List;

    constructor(
        scene: FightScene,
        gameStore: GameStore,
        private readonly playerStore: PlayerStore,
        private readonly actionStore: ActionsStore,
    ) {
        super(scene, gameStore);
        this.root = new DisplayRoot();
    }

    public clearCurrentAction() {
        this.actionElements.forEach((action) => action.hightlight(false));
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
            onClick: () => this.scene.root.controllers.actions.clearAction(),
        }).setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.CONTAINER));
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

        this.actionsList = new List(this.scene, actionListGrid).setDepth(
            Depth.getUIElementDepth(UI_LEVELS_OFFSET.BUTTON),
        );
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
                text: i18n.translate("fight.actions.endTurn"),
                borderColor: Color.MILITARY_GREEN,
                borderWidth: 2,
                onClick: () => {},
            },
        )
            .setIsActivated(false)
            .setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.BUTTON));
        this.root.add(this.endTurnButton);

        return this;
    }

    render(): this {
        this.actionStore.orderedActions = [];
        this.playerStore.playerClass.actionList.forEach((action, index) => {
            this.actionStore.orderedActions.push(action);
            const iconObj = this.actionsList.placeElement(
                { x: index, y: 0 },
                (area) => {
                    const buttonArea = area.scaleFromCenter(
                        ActionAsset.getAssetScale(action.id),
                        ScaleMode.FILL,
                    );
                    const button = new Button(this.scene, buttonArea, {
                        image: ActionAsset.getAssetKey(action.id),
                        onClick: () =>
                            this.scene.root.controllers.actions.handleActionSelection(
                                action,
                            ),
                    }).setDepth(
                        Depth.getUIElementDepth(UI_LEVELS_OFFSET.BUTTON),
                    );
                    if (action.cost > 0) {
                        const buttonGrid = buttonArea.getGrid({
                            division: { vertical: 3, horizontal: 3 },
                        });
                        const text = new DisplayText(
                            this.scene,
                            buttonGrid.getArea({ x: 3, y: 1 }),
                        )
                            .setText(`${action.cost}`)
                            .setDepth(
                                Depth.getUIElementDepth(
                                    UI_LEVELS_OFFSET.BUTTON,
                                ) + 1,
                            );
                        this.root.add(text);
                    }
                    this.root.add(button);
                    return button;
                },
            );
            const actionDesc: string[] = [];

            if (action.actionType) {
                actionDesc.push(
                    i18n.translate(`fight.actions.type.${action.actionType}`),
                );
            }
            if (action.cost) {
                actionDesc.push(
                    `${i18n.translate("fight.actions.cost")}: ${action.cost}`,
                );
                if (action.range) {
                    if (action.range.min === action.range.max) {
                        actionDesc.push(
                            `${i18n.translate("fight.actions.range")}: ${action.range.min}`,
                        );
                    } else {
                        actionDesc.push(
                            `${i18n.translate("fight.actions.range")}: ${action.range.min}-${action.range.max}`,
                        );
                    }
                }
            }
            if (iconObj) {
                this.scene.tooltip.attachTo(
                    iconObj,
                    actionDesc.join("\n"),
                    action.name ?? action.id,
                );
                this.actionElements.set(action.id, iconObj);
            }
        });

        this.endTurnButton
            .setOnClick(() => {
                this.scene.root.controllers.actions.finishTurn();
            })
            .setIsActivated(true);

        return this;
    }

    update(): this {
        if (this.playerStore.playerEntity.dead) {
            this.root.blur();
        } else {
            this.root.unblur();
        }
        const isPlayerTurn =
            this.gameStore.game.playerTurns[0] ===
            this.playerStore.playerEntity.id;

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
}

