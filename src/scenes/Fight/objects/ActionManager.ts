import { GameScene, Position } from "../../../core";
import { Action } from "../../../Model/Action"
import { FightScene } from "../fight.scene";

export class ActionManager{
    public currentAction : Action | undefined;
    public scene! : FightScene;

    constructor(scene : FightScene){
        this.scene = scene;
    }

    clearCurentAction(){
        this.currentAction = undefined;
    }

    launchAction(pos : Position){
        //to implement
        this.scene.playerSocket.action({
            actionId : this.currentAction?.id || "",
            target : pos
        })

        this.clearCurentAction();
    }
}