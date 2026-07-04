const SoundLevelPrefix = "sound-level";

export enum SoundParam {
    EFFECT = "EFFECT",
    BACKGROUND = "BACKGROUND",
}

export function set(param: SoundParam, level: number) {
    localStorage.setItem(`${SoundLevelPrefix}-${param}`, String(level));
}

export function get(param: SoundParam) {
    const storedLevel = localStorage.getItem(`${SoundLevelPrefix}-${param}`);
    return storedLevel ? Number(storedLevel) : 0.4;
}

