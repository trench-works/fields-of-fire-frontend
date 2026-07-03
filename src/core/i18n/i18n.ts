const DEFAULT_LANGUAGE = "en";

import translations from "../../../public/i18n/en.json";

type NestedKeyOf<T> = T extends object
    ? {
          [K in keyof T & (string | number)]: T[K] extends object
              ? `${K}.${NestedKeyOf<T[K]>}`
              : `${K}`;
      }[keyof T & (string | number)]
    : never;

type TranslationKey = NestedKeyOf<typeof translations>;

export function loadBase() {
    load(DEFAULT_LANGUAGE);
    const preferredLanguage = localStorage.getItem("language");
    if (preferredLanguage) {
        load(preferredLanguage);
    } else {
        const simplifiedNavigatorLanguage = navigator.language.split("-")[0];
        changeLanguage(simplifiedNavigatorLanguage);
        if (simplifiedNavigatorLanguage !== DEFAULT_LANGUAGE) {
            load(simplifiedNavigatorLanguage);
        }
    }
}

export function changeLanguage(language: string): void {
    localStorage.setItem("language", language);
}

export async function load(language: string): Promise<void> {
    const tradResponse = await fetch(
        `${window.location.href}i18n/${language}.json`,
    );
    localStorage.setItem(
        `i18n-${language}`,
        JSON.stringify(await tradResponse.json()),
    );
}

export function getCurrentLanguage(): string {
    const language = localStorage.getItem("language");
    return language ?? "fr";
}

export function translate(key: TranslationKey, language?: string): string {
    language ??= localStorage.getItem("language") ?? undefined;
    let tradFile = localStorage.getItem(`i18n-${language ?? DEFAULT_LANGUAGE}`);
    if (!tradFile) {
        tradFile = localStorage.getItem(`i18n-${DEFAULT_LANGUAGE}`);
        if (!tradFile) {
            return "NO_TRANSLATION_FILE";
        }
    }
    const trad: Translation = JSON.parse(tradFile);
    const keys = key.split(".");
    const value = getSubElement(keys, trad);
    return (
        value ??
        (language !== DEFAULT_LANGUAGE
            ? translate(key, DEFAULT_LANGUAGE)
            : "NO_TRANSLATION")
    );
}

interface Translation {
    [key: string]: Translation | string;
}

function getSubElement(keys: string[], obj: Translation): string | null {
    if (typeof obj === "string") {
        return null;
    }
    if (keys.length === 1) {
        return obj[keys[0]] ? String(obj[keys[0]]) : null;
    } else {
        const subObj = obj[keys[0]];
        if (typeof subObj === "string") {
            return null;
        }
        keys.shift();
        return getSubElement(keys, subObj);
    }
}

