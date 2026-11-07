import { Http } from "../../../core";
import { CharacterClass } from "../../../Model/CharacterClass";

export class ClassesRepository {
    async getClasses(): Promise<CharacterClass[]> {
        return (await Http.get<CharacterClass[]>("/class"))?.data ?? [];
    }
}

