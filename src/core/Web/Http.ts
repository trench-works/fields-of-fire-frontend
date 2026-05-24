/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppConfigLoader } from "../../config/AppConfig";

export class HttpPayload<Param, Query, Body> {
    param?: Param;
    query?: Query;
    body?: Body;
}

export class Http {
    static async get<
        Response,
        Param extends object = any,
        Query extends object = any,
    >(
        endpoint: string,
        payload?: HttpPayload<Param, Query, never>,
    ): Promise<Response> {
        return Http.fetch<Response, Param, Query>("GET", endpoint, payload);
    }

    static async post<
        Response,
        Param extends object = any,
        Body extends object = any,
    >(
        endpoint: string,
        payload?: HttpPayload<Param, never, Body>,
    ): Promise<Response> {
        return Http.fetch<Response, Param, never, Body>(
            "POST",
            endpoint,
            payload,
        );
    }

    private static async fetch<
        Response,
        Param extends object = any,
        Query extends object = any,
        Body extends object = any,
    >(
        method: string,
        endpoint: string,
        payload?: HttpPayload<Param, Query, Body>,
    ): Promise<Response> {
        if (!global.config) {
            await new AppConfigLoader().loadConfig().then((appConfig) => {
                global.config = appConfig.getConfig();
            });
        }
        let paramEndpoint = endpoint;
        if (payload?.param) {
            for (const [key, value] of Object.entries(payload?.param)) {
                paramEndpoint = paramEndpoint.replace(
                    `{${key}}`,
                    String(value),
                );
            }
        }
        let url = `${global.config.server.protocol}://${global.config.server.url}${paramEndpoint}`;
        if (payload?.query) {
            url += "?";
            for (const [key, value] of Object.entries(payload?.query)) {
                if (!url.endsWith("?")) {
                    url += "&";
                }
                url += `${key}=${value}`;
            }
        }
        const rep = await fetch(url, {
            method,
            body: payload?.body ? JSON.stringify(payload?.body) : undefined,
        });
        const data: Response = await rep.json();
        return data;
    }
}

