import { Scene } from "phaser";
import { Character } from "./objects/Character";
import { GameObject } from "../../core/Objects/GameObject";
import { Position } from "../../core/Types/Position";
import { Game } from "../../Model/Game";

export type SceneRenderConfig = {
    tileSize: number;
    renderType: string;
    offset: Position;
};

export type RenderResult = {
    position: Position;
    sprite: string;
};

export type Cell = {
    gridPosition: Position;
    pixelPosition: Position;
    zone: Phaser.GameObjects.Zone;
    hoverGraphics?: Phaser.GameObjects.Graphics;
};

export interface Displayable {
    render(renderConfig: SceneRenderConfig): RenderResult | RenderResult[];
}

export class GameScene extends Scene {
    public fightMap = "chessmap";
    public tileSetImage = "ground";
    public tileWidth = 64;
    public renderConfig: SceneRenderConfig | undefined;
    public displayObjects: Displayable[] = [];
    public gameObjects: GameObject[] = [];
    public characters: Character[] = [];
    public myPlayer!: Character;
    public gridPositions: Cell[][] = [];
    public scaleFactor: number = 1;

    public gamePayload!: Game;

    spawnEntities() {
        this.characters.forEach((entity) => {
            entity.spawn(this, this.scaleFactor, this.gridPositions);
        });
    }
}

