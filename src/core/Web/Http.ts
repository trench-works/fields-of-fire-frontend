const BASE_URL = "localhost:3000";

export class Http {
    static async fetch<Ressource>(endpoint: string): Promise<Ressource[]> {
        const rep = await fetch("http://" + BASE_URL + endpoint);
        const data: Ressource[] = await rep.json();
        return data;
    }
}

