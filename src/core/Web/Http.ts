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
        payload: HttpPayload<Param, Query, Body> | undefined,
    ): Promise<Response> {
        if (!globalThis.config) {
            await new AppConfigLoader().loadConfig().then((appConfig) => {
                globalThis.config = appConfig.getConfig();
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

        const port = Number(globalThis.config.server.port);
        const portStr = port === 443 || port === 80 ? "" : `:${port}`;
        const base = `${globalThis.config.server.protocols.http}://${globalThis.config.server.url}${portStr}${globalThis.config.server.apiBasePath}`;
        let url = `${base}${paramEndpoint}`;

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
            headers: {
                "Content-Type": "application/json",
                uuid: String(globalThis.user?.id),
            },
        });
        const data: Response = await rep.json();
        return data;
    }
}

