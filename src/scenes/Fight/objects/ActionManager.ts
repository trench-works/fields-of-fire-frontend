import { GameScene, Position } from "../../../core";
import { Action } from "../../../Model/Action";
import { FightScene } from "../fight.scene";
import { GamePlayerSocket } from "../repositories/player.repository";

export class ActionManager {
    public currentAction: Action | undefined;
    public scene!: FightScene;

    constructor(scene: FightScene) {
        this.scene = scene;
    }

    clearCurentAction() {
        this.currentAction = undefined;
    }
    

    launchAction(pos: Position) {
        //to implement
        this.scene.playerSocket.action({
            actionId: this.currentAction?.id || "",
            target: pos,
        });
        this.clearCurentAction();
    }

    bindListener() {
        this.scene.playerSocket.onMove(({ entity: { entityId, position } }) => {
            console.log(`Entity ${entityId} moved to position ${position.x}, ${position.y}`);
            
            this.scene.myPlayer.move(position, this.scene.gridPositions)
        });
    }
}
