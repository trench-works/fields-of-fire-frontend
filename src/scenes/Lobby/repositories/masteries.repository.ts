import { Http } from "../../../core";
import { MasteryTree } from "../../../Model/Mastery";

export class MasteriesRepository {
    async getMasteries(): Promise<MasteryTree[]> {
        return (await Http.get<MasteryTree[]>("/masteries"))?.data ?? [];
    }
}

