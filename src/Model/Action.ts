import { Position } from "../core";
import { Effect } from "./Effect";
export type ActionProps = {
    id: string;
    iconSpriteKey: string;
    animationSpriteKey?: string;
    animationSpriteConfig?: { frameWidth: number; frameHeight: number };
    animationSprite?: Phaser.GameObjects.Sprite;
    Key?: string;
    name: string;
    description?: string;
    dammage?: number;
    effectList?: Effect[];
    range?: number;
    zoneType?: string;
    zoneSize?: number;
    mooveToTarget?: Position;
    pushValue?: number;
    cost: number;
    isWalkAction?: boolean;
};

export class Action {
    private pushValue: number = 0;
    constructor(public props: ActionProps) {
        this.pushValue = props.pushValue || 0;
    }
}

