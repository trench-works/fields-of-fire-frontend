export type GameAnimation<
    key extends string = string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data extends Record<string, any> = Record<string, any>,
> = {
    key: key;
    data: data;
};

export type AnimatedPayload<data, animation extends GameAnimation> = {
    data: data;
    animations: animation[];
};

