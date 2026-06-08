import { ActionAsset, ActionAssetId } from "../../../assets/ActionAsset";
import { Color } from "../../../config/ColorConfig";
import {
    CustomContainer,
    DataDisplayer,
    Button,
    DataDisplayObject,
    Grid,
} from "../../../core";
import { Action } from "../../../Model/Action";
import { FightScene } from "../fight.scene";
import { GameStore } from "../stores/GameStore";
import { PlayerStore } from "../stores/PlayerStore";
import { FightSceneDisplayer } from "./FightSceneDisplayer";

const CLICKABLE_ALPHA = 1;
const UNCLICKABLE_ALPHA = 0.5;

export class ActionDisplayer extends FightSceneDisplayer {
    /**
     * Displayed Elements
     */
    protected actionElements: Map<string, DataDisplayObject> = new Map();
    protected endTurnButton!: Button;
    protected actionsList!: DataDisplayer;

    constructor(
        scene: FightScene,
        gameStore: GameStore,
        private readonly playerStore: PlayerStore,
    ) {
        super(scene, gameStore);
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
        const actionArea = this.scene.sceneGrid.getArea({
            x: 2,
            y: 8,
            width: 5,
            height: 1,
        });
        const actionPanel = new CustomContainer(this.scene, {
            title: "",
            x: actionArea.x + actionArea.width / 2,
            y: actionArea.y + actionArea.height / 2,
            width: actionArea.width,
            height: actionArea.height,
            borderWidth: 2,
            opacity: 0.5,
        });

        const actionGrid = new Grid({
            size: {
                width: actionPanel.width,
                height: actionPanel.height,
            },
        });
        const actionListArea = actionGrid.getArea({
            x: 0,
            y: 1,
            width: 7,
            height: 7,
        });

        this.actionsList = new DataDisplayer(this.scene, {
            position: {
                x:
                    actionPanel.x -
                    actionPanel.width / 2 +
                    actionListArea.center.x,
                y:
                    actionPanel.y -
                    actionPanel.height / 2 +
                    actionListArea.center.y,
            },
            width: actionListArea.width,
            height: actionListArea.height,
            cols: 7,
            rows: 1,
        });

        const endTurnArea = actionGrid.getArea({
            x: 7,
            y: 1,
            width: 1.9,
            height: 7,
        });

        this.endTurnButton = new Button(this.scene, {
            x: actionPanel.x - actionPanel.width / 2 + endTurnArea.center.x,
            y: actionPanel.y - actionPanel.height / 2 + endTurnArea.center.y,
            width: endTurnArea.width,
            height: endTurnArea.height,
            text: "Fin du tour",
            borderColor: Color.containerBorder,
            borderWidth: 2,
        });

        return this;
    }

    render(): this {
        this.playerStore.playerClass.actionList.forEach((action, index) => {
            const iconObj = this.actionsList.placeContent(
                index,
                0,
                {
                    icon: ActionAsset.getAssetKey(action.id),
                    onClick: () => this.handleActionClick(action),
                    alpha: 1,
                },
                64,
            );
            if (iconObj) {
                this.scene.tooltip.attachTo(iconObj, action.name ?? action.id);
                this.actionElements.set(action.id, iconObj);
            }
        });

        this.endTurnButton.onClick = () => {
            this.scene.playerSocket.finishTurn();
        };

        return this;
    }

    update(): this {
        const isPlayerTurn =
            this.gameStore.game.playerTurns[0] ===
            this.playerStore.playerEntity.entityId;
        const hasMovement = this.playerStore.playerEntity.stats.mouvement > 0;
        const hasEnergy = this.playerStore.playerEntity.stats.energy > 0;

        this.playerStore.playerClass.actionList.forEach((action) => {
            const actionObject = this.actionElements.get(action.id)!;
            switch (action.id) {
                case ActionAssetId.WALK:
                    actionObject.setInteractive(isPlayerTurn && hasMovement);
                    actionObject.setAlpha(
                        isPlayerTurn && hasMovement
                            ? CLICKABLE_ALPHA
                            : UNCLICKABLE_ALPHA,
                    );
                    break;
                default:
                    actionObject.setInteractive(isPlayerTurn && hasEnergy);
                    actionObject.setAlpha(
                        isPlayerTurn && hasEnergy
                            ? CLICKABLE_ALPHA
                            : UNCLICKABLE_ALPHA,
                    );
                    break;
            }
        });
        this.endTurnButton.setInteractive(isPlayerTurn);
        this.endTurnButton.setAlpha(
            isPlayerTurn ? CLICKABLE_ALPHA : UNCLICKABLE_ALPHA,
        );
        this.endTurnButton.onClick = isPlayerTurn
            ? () => this.scene.playerSocket.finishTurn()
            : undefined;
        return this;
    }

    async animate(): Promise<this> {
        return this;
    }
}

