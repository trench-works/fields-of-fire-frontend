import { AppConfigLoader } from "../../config/AppConfig";

export class Http {
    static async fetch<Ressource>(endpoint: string): Promise<Ressource[]> {
        if (!global.config) {
            await new AppConfigLoader().loadConfig().then((appConfig) => {
                global.config = appConfig.getConfig();
            });
        }
        const url = `${global.config.server.protocol}://${global.config.server.url}${endpoint}`;
        const rep = await fetch(url);
        const data: Ressource[] = await rep.json();
        return data;
    }
}

