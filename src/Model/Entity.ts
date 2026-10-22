import { CharacterAssetId } from "../assets";
import { Position } from "../core";
import { Boost } from "./Boost";
import { Effect } from "./Effect";
import { Stats } from "./Stats";

export enum EntityType {
    PLAYER = "PLAYER",
    NPC = "NPC",
}

export type Entity = {
    id: string;
    classId: CharacterAssetId;
    teamId: string;
    position: Position;
    type: EntityType;
    stats: Stats;
    effects: Effect[];
    boosts: Boost[];
    dead: boolean;
    isInvocation: boolean;
    isPlaying: boolean;
};

