export enum TeamColor {
    BLUE = "BLUE",
    RED = "RED",
    YELLOW = "YELLOW",
    GREEN = "GREEN",
}
export const TEAM_COLORS = {
    [TeamColor.BLUE]: 0x0000ff,
    [TeamColor.RED]: 0xff0000,
    [TeamColor.YELLOW]: 0xff00ff,
    [TeamColor.GREEN]: 0x00ff00,
};

export type Team = {
    id: string;
    color: TeamColor;
};

