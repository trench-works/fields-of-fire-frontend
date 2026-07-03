const keyBindsStorageKey = "key-binds";

export enum KeyBind {
    // ACTIONS
    ONE = "ONE",
    TWO = "TWO",
    THREE = "THREE",
    FOUR = "FOUR",
    FIVE = "FIVE",
    SIX = "SIX",
    SEVEN = "SEVEN",
    EIGHT = "EIGHT",
    NINE = "NINE",
    ZERO = "ZERO",
    // CURSOR MOVE
    UP = "UP",
    LEFT = "LEFT",
    DOWN = "DOWN",
    RIGHT = "RIGHT",
    // LAUNCH
    ENTER = "ENTER",
}

export type KeyBinds = {
    // ACTIONS
    [KeyBind.ONE]: string;
    [KeyBind.TWO]: string;
    [KeyBind.THREE]: string;
    [KeyBind.FOUR]: string;
    [KeyBind.FIVE]: string;
    [KeyBind.SIX]: string;
    [KeyBind.SEVEN]: string;
    [KeyBind.EIGHT]: string;
    [KeyBind.NINE]: string;
    [KeyBind.ZERO]: string;
    // CURSOR MOVE
    [KeyBind.UP]: string;
    [KeyBind.LEFT]: string;
    [KeyBind.DOWN]: string;
    [KeyBind.RIGHT]: string;
    // LAUNCH
    [KeyBind.ENTER]: string;
};

const defaultKeyBinds: KeyBinds = {
    // ACTIONS
    [KeyBind.ONE]: "Digit1",
    [KeyBind.TWO]: "Digit2",
    [KeyBind.THREE]: "Digit3",
    [KeyBind.FOUR]: "Digit4",
    [KeyBind.FIVE]: "Digit5",
    [KeyBind.SIX]: "Digit6",
    [KeyBind.SEVEN]: "Digit7",
    [KeyBind.EIGHT]: "Digit8",
    [KeyBind.NINE]: "Digit9",
    [KeyBind.ZERO]: "Digit0",
    // CURSOR MOVE
    [KeyBind.UP]: "ArrowUp",
    [KeyBind.LEFT]: "ArrowLeft",
    [KeyBind.DOWN]: "ArrowDown",
    [KeyBind.RIGHT]: "ArrowRight",
    // LAUNCH
    [KeyBind.ENTER]: "Enter",
};

export function getKeyBinds(): KeyBinds {
    const keyBinds = localStorage.getItem(keyBindsStorageKey);
    if (!keyBinds) {
        setKeyBinds(defaultKeyBinds);
        return defaultKeyBinds;
    }
    return JSON.parse(keyBinds);
}

export function setKeyBinds(keyBinds: KeyBinds): KeyBinds {
    localStorage.setItem(keyBindsStorageKey, JSON.stringify(keyBinds));
    return getKeyBinds();
}

export function getDefaultKeyBinds(): KeyBinds {
    return defaultKeyBinds;
}

