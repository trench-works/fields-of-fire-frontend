import { Http } from "../../../core";
import { Authenticate } from "../interfaces/Authenticate";
import { User } from "../interfaces/User";

export class UserRepository {
    async authenticate(username: string, password: string): Promise<void> {
        const user = await Http.post<User, never, Authenticate>(
            "/authenticate",
            { body: { username, password } },
        );
        if (user) {
            global.user = user;
        }
    }

    async register(username: string, password: string): Promise<void> {
        const user = await Http.post<User, never, Authenticate>("/register", {
            body: { username, password },
        });
        if (user) {
            global.user = user;
        }
    }
}

