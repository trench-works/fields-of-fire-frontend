import { Http } from "../../../core";
import { Authenticate } from "../interfaces/Authenticate";
import { User } from "../interfaces/User";

export class UserRepository {
    async authenticate(username: string): Promise<void> {
        const user = await Http.post<User, never, Authenticate>(
            "/authenticate",
            {
                body: {
                    username,
                },
            },
        );
        if (user) {
            global.user = user;
        }
    }
}

