export enum TeamColor {
    BLUE = "BLUE",
    RED = "RED",
    YELLOW = "YELLOW",
    GREEN = "GREEN",
}
export const TEAM_COLORS = {
    [TeamColor.BLUE]: 0x0000ff,
    [TeamColor.RED]: 0xff0000,
    [TeamColor.YELLOW]: 0xffff00,
    [TeamColor.GREEN]: 0x00ff00,
};
export const TEAM_STRING_COLORS = {
    [TeamColor.BLUE]: "#0000ff",
    [TeamColor.RED]: "#ff0000",
    [TeamColor.YELLOW]: "#ffff00",
    [TeamColor.GREEN]: "#00ff00",
};

export type Team = {
    id: string;
    color: TeamColor;
};

