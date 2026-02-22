export function parseColor(color?: string): number {
    if (!color) return 0xffffff;
    return Phaser.Display.Color.HexStringToColor(color).color;
}

