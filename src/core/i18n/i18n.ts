export async function load(language: string): Promise<void> {
    const simplifiedLanguage = language.split("-")[0];
    localStorage.setItem("language", simplifiedLanguage);
    const tradResponse = await fetch(
        `${window.location.href}i18n/${simplifiedLanguage}.json`,
    );
    localStorage.setItem(
        `i18n-${simplifiedLanguage}`,
        JSON.stringify(await tradResponse.json()),
    );
}

export function translate(key: string): string {
    const language = localStorage.getItem("language");
    const tradFile = localStorage.getItem(`i18n-${language ?? "fr"}`);
    if (!tradFile) {
        return "NO_TRANSLATION";
    }
    const trad: TranslationFile = JSON.parse(tradFile);
    const keys = key.split(".");

    const subObj = trad[keys[0]];
    if (typeof subObj === "string") {
        return subObj;
    }
    keys.shift();
    return getSubElement(keys, subObj);
}

type TranslationFile = Record<string, Translation>;
type Translation = NestedTranslation | string;
type NestedTranslation = Record<string, Translation>;

function getSubElement(keys: string[], obj: Translation) {
    if (typeof obj === "string") {
        return "NO_TRANSLATION";
    }
    if (keys.length === 1) {
        return obj[keys[0]] ?? "NO_TRANSLATION";
    } else {
        const subObj = obj[keys[0]];
        if (typeof subObj === "string") {
            return "NO_TRANSLATION";
        }
        keys.shift();
        return getSubElement(keys, subObj);
    }
}

