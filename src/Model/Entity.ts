import { ActionAssetId, CharacterAssetId } from "../assets";
import { Position } from "../core";
import { Action } from "./Action";
import { Boost } from "./Boost";
import { Effect } from "./Effect";
import { Stats } from "./Stats";

export enum EntityType {
    PLAYER = "PLAYER",
    NPC = "NPC",
}

export class Entity  {
    id!: string;
    classId!: CharacterAssetId;
    teamId!: string;

    position!: Position;
    actionList!: ActionAssetId[];
    modifiedActionList?:Action[];
    
    type!: EntityType;
    stats!: Stats;
    effects!: Effect[];
    boosts!: Boost[];
    dead!: boolean;
    isInvocation!: boolean;
    isPlaying!: boolean;
    actionUses!: Record<string, Record<string, number>>;
};
