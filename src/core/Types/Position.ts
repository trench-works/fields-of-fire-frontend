export class Position {
    public x: number;
    public y: number;

    constructor(x?: number, y?: number) {
        this.x = x ?? 0;
        this.y = y ?? 0;
    }

    add(position: Position): void {
        this.x += position.x;
        this.y += position.y;
    }
}
