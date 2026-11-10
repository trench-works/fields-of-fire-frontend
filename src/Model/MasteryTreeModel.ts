import { Mastery, MasteryRequirement, MasteryTree, MasterySelection } from "./Mastery";


export type MasteryLink = { from: string; to: string; kind: "requires" | "anyOf" };
export type MasteryNodeLayout = { mastery: Mastery; branchId: string; rank: number; x: number };
export type BranchLayout = { branch: Mastery; x: number; width: number };
export type MasteryLayout = {
    root?: { mastery: Mastery; x: number };
    nodes: MasteryNodeLayout[];
    branches: BranchLayout[];
    links: MasteryLink[];
    rankCount: number; // nombre de rangs hors passifs (racine incluse)
};

const requirementIds = (reqs?: MasteryRequirement[]): string[] =>
    (reqs ?? []).flatMap((r) =>
        "anyOf" in r ? r.anyOf.map((x) => x.masteryId) : [r.masteryId],
    );

export class MasteryTreeModel {
    /** maîtrises sélectionnables (racine + sous-maîtrises), pas les branches */
    readonly byId = new Map<string, Mastery>();

    constructor(readonly tree: MasteryTree) {
        if (tree.rootMastery) this.byId.set(tree.rootMastery.id, tree.rootMastery);
        for (const branch of tree.masteries) {
            for (const sub of branch.subMasteries ?? []) this.byId.set(sub.id, sub);
        }
    }

    // ---------- règles ----------

    spent(sel: MasterySelection): number {
        return Object.values(sel).reduce((sum, l) => sum + l, 0);
    }

    private isMet(req: MasteryRequirement, sel: MasterySelection): boolean {
        if ("anyOf" in req) return req.anyOf.some((r) => this.isMet(r, sel));
        return (sel[req.masteryId] ?? 0) >= req.level;
    }

    requirementsMet(m: Mastery, sel: MasterySelection): boolean {
        return (m.masteryRequirements ?? []).every((r) => this.isMet(r, sel));
    }

    isExcluded(m: Mastery, sel: MasterySelection): boolean {
        return (m.exclusiveWith ?? []).some((id) => (sel[id] ?? 0) > 0);
    }

    pointsInBranch(branch: Mastery, sel: MasterySelection): number {
        return (branch.subMasteries ?? []).reduce((s, m) => s + (sel[m.id] ?? 0), 0);
    }

    isPassiveUnlocked(branch: Mastery, sel: MasterySelection): boolean {
        return this.pointsInBranch(branch, sel) >= (branch.masteringPointsRequired ?? 0);
    }

    canAdd(id: string, sel: MasterySelection, available: number): boolean {
        const m = this.byId.get(id);
        if (!m) return false;
        return (
            (sel[id] ?? 0) < m.maxLevel &&
            this.spent(sel) < available &&
            this.requirementsMet(m, sel) &&
            !this.isExcluded(m, sel)
        );
    }

    /** grisée = aucun point dedans ET impossible d'en ajouter */
    isGreyed(id: string, sel: MasterySelection, available: number): boolean {
        return (sel[id] ?? 0) === 0 && !this.canAdd(id, sel, available);
    }

    add(id: string, sel: MasterySelection, available: number): MasterySelection {
        if (!this.canAdd(id, sel, available)) return sel;
        return { ...sel, [id]: (sel[id] ?? 0) + 1 };
    }

    remove(id: string, sel: MasterySelection): MasterySelection {
        const level = sel[id] ?? 0;
        if (level < 1) return sel;
        const next = { ...sel };
        if (level === 1) delete next[id];
        else next[id] = level - 1;
        return this.normalize(next);
    }

    /** remet à 0 tout ce dont les prérequis ne sont plus remplis, en chaîne */
    normalize(sel: MasterySelection): MasterySelection {
        const next = { ...sel };
        let changed = true;
        while (changed) {
            changed = false;
            for (const id of Object.keys(next)) {
                const m = this.byId.get(id);
                if (!m || !this.requirementsMet(m, next)) {
                    delete next[id];
                    changed = true;
                }
            }
        }
        return next;
    }

    // ---------- placement ----------
    layout(): MasteryLayout {
        const rootId = this.tree.rootMastery?.id;
        const memo = new Map<string, number>();

        const rankOf = (m: Mastery, seen = new Set<string>()): number => {
            if (m.id === rootId) return 0;
            const known = memo.get(m.id);
            if (known !== undefined) return known;
            if (seen.has(m.id)) return 1; // garde-fou contre un cycle
            seen.add(m.id);
            const parents = requirementIds(m.masteryRequirements)
                .map((id) => this.byId.get(id))
                .filter((p): p is Mastery => !!p);
            const rank = parents.length
                ? 1 + Math.max(...parents.map((p) => rankOf(p, seen)))
                : 1;
            memo.set(m.id, rank);
            return rank;
        };

        const branchWidth = 1 / Math.max(1, this.tree.masteries.length);
        const xOf = new Map<string, number>();
        if (rootId) xOf.set(rootId, 0.5);

        const nodes: MasteryNodeLayout[] = [];
        const branches: BranchLayout[] = [];
        let maxRank = 0;

        this.tree.masteries.forEach((branch, i) => {
            const start = i * branchWidth;
            branches.push({ branch, x: start + branchWidth / 2, width: branchWidth });

            const rows = new Map<number, Mastery[]>();
            for (const sub of branch.subMasteries ?? []) {
                const r = rankOf(sub);
                rows.set(r, [...(rows.get(r) ?? []), sub]);
            }

            for (const rank of [...rows.keys()].sort((a, b) => a - b)) {
                maxRank = Math.max(maxRank, rank);
                const key = (m: Mastery) => {
                    const xs = requirementIds(m.masteryRequirements)
                        .map((id) => xOf.get(id))
                        .filter((x): x is number => x !== undefined);
                    return xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : start + branchWidth / 2;
                };
                const sorted = rows
                    .get(rank)!
                    .map((m, index) => ({ m, index, k: key(m) }))
                    .sort((a, b) => a.k - b.k || a.index - b.index);
                sorted.forEach(({ m }, j) => {
                    const x = start + (branchWidth * (j + 0.5)) / sorted.length;
                    xOf.set(m.id, x);
                    nodes.push({ mastery: m, branchId: branch.id, rank, x });
                });
            }
        });

        const links: MasteryLink[] = [];
        for (const m of this.byId.values()) {
            for (const req of m.masteryRequirements ?? []) {
                if ("anyOf" in req) {
                    for (const r of req.anyOf) links.push({ from: r.masteryId, to: m.id, kind: "anyOf" });
                } else {
                    links.push({ from: req.masteryId, to: m.id, kind: "requires" });
                }
            }
        }

        return {
            root: this.tree.rootMastery ? { mastery: this.tree.rootMastery, x: 0.5 } : undefined,
            nodes,
            branches,
            links,
            rankCount: maxRank + 1,
        };
    }
}