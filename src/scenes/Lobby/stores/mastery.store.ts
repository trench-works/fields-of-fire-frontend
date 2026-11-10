import { MasterySelection, MasteryTree } from "../../../Model/Mastery";
import { MasteryTreeModel } from "../../../Model/MasteryTreeModel";

//a modifier quand on aura un syteme de leveling
export const DEFAULT_MASTERY_POINTS = 10;

export class MasteryStore {
    private models = new Map<string, MasteryTreeModel>();
    public classId?: string;
    public selection: MasterySelection = {};
    public availablePoints = DEFAULT_MASTERY_POINTS;

    setTrees(trees: MasteryTree[]): void {
        this.models = new Map(trees.map((t) => [t.classId, new MasteryTreeModel(t)]));
    }

    /** changer de classe vide la sélection : l'arbre n'est plus le même */
    setClass(classId: string): void {
        if (this.classId !== classId) {
            this.classId = classId;
            this.selection = {};
        }
    }

    get model(): MasteryTreeModel | undefined {
        return this.classId ? this.models.get(this.classId) : undefined;
    }

    get remaining(): number {
        return this.availablePoints - (this.model?.spent(this.selection) ?? 0);
    }

    add(id: string): void {
        if (this.model) this.selection = this.model.add(id, this.selection, this.availablePoints);
    }

    remove(id: string): void {
        if (this.model) this.selection = this.model.remove(id, this.selection);
    }

    reset(): void {
        this.selection = {};
    }
}