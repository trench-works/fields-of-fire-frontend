import { StatsDisplayer } from "../display/stats.displayer";
import { ClassStore } from "../stores/class.store";
import { GameStore } from "../stores/game.store";

export class InspectCharacterService {
    constructor(
        private readonly gameStore: GameStore,
        private readonly classStore: ClassStore,
        private readonly inspectStats: StatsDisplayer,
    ) {}

    public inspectCharacter(entityId: string) {
        const entity = this.gameStore.getEntity(entityId);
        const charClass = this.classStore.getClass(entity.classId);
        this.inspectStats
            .setEntity(entity)
            .setCharacterClass(charClass)
            .setName(charClass.name.split(" ")[0])
            .update()
            .setIsShow(true);
    }
}
