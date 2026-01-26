import { Effect } from "./Effect";

export class Action {
    
    constructor(
        public id : String,
        public name : String,
        public description : string,
        public dammage : number,
        public effectList : Effect[],
        public range : number,
        public zoneType: string,
        public zoneSize: number,
    ){}
    
}