import { ActionAsset, ActionAssetId } from "../../../assets/ActionAsset";
import { Color } from "../../../config/ColorConfig";
import {
    CustomContainer,
    Position,
    DataDisplayer,
    GridUtils,
    Button,
    DataDisplayObject,
} from "../../../core";
import { Tooltip } from "../../../core/UI/Tooltip";
import { Action } from "../../../Model/Action";
import { CharacterClass } from "../../../Model/CharacterClass";
import { Entity } from "../../../Model/Entity";
import { FightSceneDisplayer } from "./FightSceneDisplayer";

const CLICKABLE_ALPHA = 1;
const UNCLICKABLE_ALPHA = 0.5;

export class ActionDisplayer extends FightSceneDisplayer {
    protected playerId!: string;
    protected playerEntity!: Entity;
    protected playerClass!: CharacterClass;

    protected actionElements: Map<string, DataDisplayObject> = new Map();
    protected endTurnButton!: Button;
    protected actionsList!: DataDisplayer;
    protected tooltip!: Tooltip;

    setPlayerInfos(playerId: string, characterClasses: CharacterClass[]): this {
        this.playerId = playerId;
        const player = this.game.players.find(
            (player) => player.playerId === playerId,
        )!;
        this.playerEntity = this.game.entities.find(
            (entity) => entity.entityId === player.entityId,
        )!;
        this.playerClass = characterClasses.find(
            (charClass) => charClass.id === this.playerEntity.classId,
        )!;
        return this;
    }

    protected handleActionClick(action: Action) {
        const isPlayerTurn =
            this.game.playerTurns[0] === this.playerEntity.entityId;
        const hasMovement = this.playerEntity.stats.mouvement > 0;
        const hasEnergy = this.playerEntity.stats.energy > 0;
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
                    this.playerEntity.position,
                    this.playerEntity.stats.mouvement,
                );
                break;
            case ActionAssetId.SHOOT:
            case ActionAssetId.HEAL:
                if (!hasEnergy) {
                    return;
                }
                this.scene.rangeVisualizer.getCellsInAttackRange(
                    this.playerEntity.position,
                    action.range ?? 0,
                );
                break;
        }

        this.scene.rangeVisualizer.showRange();
        this.scene.actionManager.currentAction = action;
    }

    preRender(): this {
        const actionArea = this.scene.sceneGrid.getArea(2, 8, 5, 1);
        const actionPanel = new CustomContainer(this.scene, {
            title: "",
            x: actionArea.x + actionArea.width / 2,
            y: actionArea.y + actionArea.height / 2,
            width: actionArea.width,
            height: actionArea.height,
            borderWidth: 2,
            opacity: 0.5,
        });

        const actionGrid = GridUtils.uiGrid(
            0,
            0,
            actionPanel.width,
            actionPanel.height,
        );
        const actionListArea = actionGrid.getArea(0, 1, 7, 7);

        this.actionsList = new DataDisplayer(this.scene, {
            position: new Position(
                actionPanel.x - actionPanel.width / 2 + actionListArea.centerX,
                actionPanel.y - actionPanel.height / 2 + actionListArea.centerY,
            ),
            width: actionListArea.width,
            height: actionListArea.height,
            cols: 7,
            rows: 1,
        });

        const endTurnArea = actionGrid.getArea(7, 1, 1.9, 7);

        this.endTurnButton = new Button(this.scene, {
            x: actionPanel.x - actionPanel.width / 2 + endTurnArea.centerX,
            y: actionPanel.y - actionPanel.height / 2 + endTurnArea.centerY,
            width: endTurnArea.width,
            height: endTurnArea.height,
            text: "Fin du tour",
            borderColor: Color.containerBorder,
            borderWidth: 2,
        });

        this.tooltip = Tooltip.getInstance(this.scene, {
            textColor: "#000000",
            fontSize: 14,
            delay: 750,
        });

        return this;
    }

    render(): this {
        this.playerClass.actionList.forEach((action, index) => {
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
                this.tooltip.attachTo(iconObj, action.name ?? action.id);
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
            this.game.playerTurns[0] === this.playerEntity.entityId;
        const hasMovement = this.playerEntity.stats.mouvement > 0;
        const hasEnergy = this.playerEntity.stats.energy > 0;

        this.playerClass.actionList.forEach((action) => {
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
                case ActionAssetId.SHOOT:
                case ActionAssetId.HEAL:
                    actionObject.setInteractive(isPlayerTurn && hasEnergy);
                    actionObject.setAlpha(
                        isPlayerTurn && hasEnergy
                            ? CLICKABLE_ALPHA
                            : UNCLICKABLE_ALPHA,
                    );
                    break;
                default:
                    actionObject.setInteractive(isPlayerTurn);
                    actionObject.setAlpha(
                        isPlayerTurn ? CLICKABLE_ALPHA : UNCLICKABLE_ALPHA,
                    );
                    break;
            }
        });
        this.endTurnButton.setInteractive(isPlayerTurn);
        this.endTurnButton.setAlpha(
            isPlayerTurn ? CLICKABLE_ALPHA : UNCLICKABLE_ALPHA,
        );
        this.endTurnButton.setHoverColor(isPlayerTurn ? undefined : null);
        this.endTurnButton.onClick = isPlayerTurn
            ? () => this.scene.playerSocket.finishTurn()
            : undefined;
        return this;
    }
}

