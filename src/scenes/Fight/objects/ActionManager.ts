import { Action } from "../../../Model/Action"

export class ActionManager{
    public currentAction : Action | undefined;

    constructor(){

    }

    clearCurentAction(){
        this.currentAction = undefined;
    }

    launchAction(){
        //to implement
    }
}