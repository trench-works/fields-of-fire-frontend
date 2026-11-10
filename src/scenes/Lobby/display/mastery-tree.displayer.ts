import Phaser from "phaser";
import { Color } from "../../../config/ColorConfig";
import {
    BaseScene,
    Button,
    ColorUtils,
    Depth,
    DisplayContainer,
    DisplayRoot,
    DisplayText,
    GridArea,
    UI_LEVELS_OFFSET,
    i18n,
} from "../../../core";
import { DisplayImage } from "../../../core/UI/DisplayImage";
import { getMasteryImageKey } from "../../../assets/MasteryAsset";
import { Mastery, MasterySelection } from "../../../Model/Mastery";
import { MasteryLayout } from "../../../Model/MasteryTreeModel";
import { MasteryStore } from "../stores/mastery.store";

const NODE_DEPTH = Depth.getUIElementDepth(UI_LEVELS_OFFSET.BUTTON);
const LINE_DEPTH = NODE_DEPTH - 0.5;
const POPUP_DEPTH = NODE_DEPTH + 20;
const HELP_DEPTH = NODE_DEPTH + 30;

/** traduction avec repli si la clé n'existe pas encore */
type TranslationKey = Parameters<typeof i18n.translate>[0];

/** traduction avec repli si la clé n'existe pas encore */
const tr = (key: string, fallback = key): string => {
    try {
        const value = i18n.translate(key as TranslationKey);
        return value && value !== key ? value : fallback;
    } catch {
        return fallback;
    }
};

type Overlay = { container: DisplayContainer; text: DisplayText };

export class MasteryTreeDisplayer {
    private active = false;
    private root?: DisplayRoot;
    private area?: GridArea;
    private layout?: MasteryLayout;
    private size = 0;
    private rowHeight = 0;

    private centers = new Map<string, { x: number; y: number }>();
    private nodes = new Map<string, { button: Button; label: DisplayText }>();
    private passives: { branch: Mastery; image: DisplayImage }[] = [];
    private extras: { destroy(): void }[] = [];
    private lines?: Phaser.GameObjects.Graphics;
    private counter?: DisplayText;
    private popup?: Overlay;
    private help?: Overlay;

    constructor(
        private readonly scene: BaseScene,
        private readonly store: MasteryStore,
        private readonly onValidate: (selection: MasterySelection) => void,
    ) {}

    // ---------- cycle de vie ----------

    build(root: DisplayRoot, area: GridArea): void {
        this.root = root;
        this.area = area;
        this.scene.input.mouse?.disableContextMenu(); // clic droit = retirer un point
        if (this.active) this.render();
    }

    setActive(active: boolean): void {
        this.active = active;
        if (active) this.render();
        else this.clear();
    }

    onTreesLoaded(): void {
        if (this.active) this.render();
    }

    onClassChanged(): void {
        if (this.active) this.render();
    }

    private clear(): void {
        this.hidePopup();
        this.hideHelp();
        this.lines?.destroy();
        this.lines = undefined;
        this.nodes.forEach(({ button, label }) => {
            button.destroy();
            label.destroy();
        });
        this.nodes.clear();
        this.passives.forEach((p) => p.image.destroy());
        this.passives = [];
        this.counter?.destroy();
        this.counter = undefined;
        this.extras.forEach((e) => e.destroy());
        this.extras = [];
        this.centers.clear();
    }

    private render(): void {
        if (!this.root || !this.area) return;
        this.clear();

        const model = this.store.model;
        if (!model) {
            const text = new DisplayText(this.scene, this.area).setText(
                tr("mastery.none", "Aucune maîtrise pour cette classe"),
            );
            this.extras.push(text);
            return;
        }

        const a = this.area;
        const layout = model.layout();
        this.layout = layout;
        this.rowHeight = a.height / (layout.rankCount + 2);

        const perRow = new Map<string, number>();
        for (const n of layout.nodes) {
            const key = `${n.branchId}:${n.rank}`;
            perRow.set(key, (perRow.get(key) ?? 0) + 1);
        }
        const maxCols = Math.max(1, ...perRow.values());
        const slot = a.width / Math.max(1, layout.branches.length) / maxCols;
        this.size = Math.min(this.rowHeight * 0.72, slot * 0.8);

        this.lines = this.scene.add.graphics().setDepth(LINE_DEPTH);

        if (layout.root) this.addNode(layout.root.mastery, layout.root.x, 0);
        for (const n of layout.nodes) this.addNode(n.mastery, n.x, n.rank);
        for (const b of layout.branches) {
            if (b.branch.passive) this.addPassive(b.branch, b.x, layout.rankCount);
        }
        this.addCounter();
        this.addButtons(layout.rankCount + 1);
        this.refresh();
    }

    private addNode(m: Mastery, xRatio: number, rank: number): void {
        const a = this.area!;
        const s = this.size;
        const cx = a.x + xRatio * a.width;
        const cy = a.y + (rank + 0.5) * this.rowHeight;
        this.centers.set(m.id, { x: cx, y: cy });

        const nodeArea = new GridArea(cx - s / 2, cy - s / 2, s, s);
        const button = new Button(this.scene, nodeArea, {
            image: getMasteryImageKey(m.id),
            borderWidth: 2,
            onClick: () => this.change(m.id, 1),
            onRightClick: () => this.change(m.id, -1),
        }).setDepth(NODE_DEPTH);
        button.on("pointerover", () =>
            this.showPopup(tr(`mastery.${m.id}.name`, m.name), this.describe(m), nodeArea),
        );
        button.on("pointerout", () => this.hidePopup());

        // "1/3" en bas à droite de la case
        const lw = s * 0.5;
        const lh = s * 0.3;
        const label = new DisplayText(
            this.scene,
            new GridArea(cx + s / 2 - lw, cy + s / 2 - lh, lw, lh),
        ).setDepth(NODE_DEPTH + 1);

        this.root!.add(button);
        this.root!.add(label);
        this.nodes.set(m.id, { button, label });
    }

    private addPassive(branch: Mastery, xRatio: number, rankCount: number): void {
        const a = this.area!;
        const s = this.size;
        const cx = a.x + xRatio * a.width;
        const cy = a.y + (rankCount + 0.5) * this.rowHeight;
        const passiveArea = new GridArea(cx - s / 2, cy - s / 2, s, s);

        const image = new DisplayImage(this.scene, passiveArea)
            .setImage(getMasteryImageKey(branch.passive!))
            .setDepth(NODE_DEPTH)
            .setInteractive(true);
        image.getObject().on("pointerover", () =>
            this.showPopup(
                tr(`passive.${branch.passive}.name`, branch.passive!),
                this.describePassive(branch),
                passiveArea,
            ),
        );
        image.getObject().on("pointerout", () => this.hidePopup());

        this.root!.add(image);
        this.passives.push({ branch, image });
    }

    private addCounter(): void {
        const a = this.area!;
        this.counter = new DisplayText(
            this.scene,
            new GridArea(a.x + 6, a.y + 4, a.width * 0.25, this.rowHeight * 0.5),
        ).setDepth(NODE_DEPTH);
        this.root!.add(this.counter);
    }

    private addButtons(row: number): void {
        const a = this.area!;
        const bs = this.rowHeight * 0.8;
        const gap = 8;
        let x = a.x + a.width - 3 * bs - 2 * gap - 4;
        const y = a.y + row * this.rowHeight + (this.rowHeight - bs) / 2;

        const make = (text: string, onClick: () => void) => {
            const button = new Button(this.scene, new GridArea(x, y, bs, bs), {
                text,
                onClick,
                borderWidth: 2,
                borderColor: Color.TEXT,
            }).setDepth(NODE_DEPTH);
            this.root!.add(button);
            this.extras.push(button);
            x += bs + gap;
        };

        make("?", () => this.toggleHelp());
        make("✔", () => this.onValidate({ ...this.store.selection }));
        make("↺", () => {
            this.store.reset();
            this.refresh();
        });
    }

    // ---------- état ----------

    private change(id: string, delta: 1 | -1): void {
        if (delta > 0) this.store.add(id);
        else this.store.remove(id);
        this.refresh();
    }

    /** met à jour textes, grisage, passifs et traits sans recréer les objets */
    private refresh(): void {
        const model = this.store.model;
        if (!model || !this.layout) return;
        const sel = this.store.selection;
        const available = this.store.availablePoints;

        for (const [id, view] of this.nodes) {
            const m = model.byId.get(id)!;
            view.label.setText(`${sel[id] ?? 0}/${m.maxLevel}`);
            view.button.setIsActivated(!model.isGreyed(id, sel, available));
        }

        for (const { branch, image } of this.passives) {
            if (model.isPassiveUnlocked(branch, sel)) image.clearTint().setAlpha(1);
            else image.setTint(0x555555).setAlpha(0.6);
        }

        this.counter?.setText(
            `${tr("mastery.points", "Points")} : ${this.store.remaining}/${available}`,
        );
        this.drawLines(sel);
    }

    private drawLines(sel: MasterySelection): void {
        const g = this.lines;
        if (!g || !this.layout) return;
        g.clear();
        const half = this.size / 2;
        const green = ColorUtils.parseColor(Color.MILITARY_GREEN);

        for (const link of this.layout.links) {
            const from = this.centers.get(link.from);
            const to = this.centers.get(link.to);
            if (!from || !to) continue;
            const lit = (sel[link.from] ?? 0) > 0;
            g.lineStyle(3, green, lit ? 1 : 0.3);
            if (link.kind === "anyOf") {
                this.dashed(g, from.x, from.y + half, to.x, to.y - half);
            } else {
                g.lineBetween(from.x, from.y + half, to.x, to.y - half);
            }
        }
    }

    private dashed(
        g: Phaser.GameObjects.Graphics,
        x1: number, y1: number, x2: number, y2: number,
        dash = 6, gap = 5,
    ): void {
        const length = Math.hypot(x2 - x1, y2 - y1);
        if (length === 0) return;
        const dx = (x2 - x1) / length;
        const dy = (y2 - y1) / length;
        for (let d = 0; d < length; d += dash + gap) {
            const e = Math.min(d + dash, length);
            g.lineBetween(x1 + dx * d, y1 + dy * d, x1 + dx * e, y1 + dy * e);
        }
    }

    // ---------- popups ----------

    private describe(m: Mastery): string {
        const lines = [tr(`mastery.${m.id}.description`, "")];
        for (const [stat, value] of Object.entries(m.statsPerLevel ?? {})) {
            if (!value) continue;
            lines.push(`${value > 0 ? "+" : ""}${value} ${tr(`stats.${stat}`, stat)} / niv.`);
        }
        for (const action of m.newActions ?? []) {
            lines.push(`${tr("mastery.unlocks", "Débloque")} : ${action.name}`);
        }
        return lines.filter(Boolean).join("\n");
    }

    private describePassive(branch: Mastery): string {
        const model = this.store.model!;
        const points = model.pointsInBranch(branch, this.store.selection);
        return [
            tr(`passive.${branch.passive}.description`, ""),
            `${points}/${branch.masteringPointsRequired ?? 0}`,
        ].filter(Boolean).join("\n");
    }

    private makeOverlay(area: GridArea, title: string, body: string, depth: number, onClick?: () => void): Overlay {
        const container = new DisplayContainer(this.scene, area, {
            title,
            borderWidth: 3,
            onClick,
        }).setDepth(depth);
        const text = new DisplayText(
            this.scene,
            new GridArea(area.x + 8, area.y + area.height * 0.22, area.width - 16, area.height * 0.74),
        )
            .setDescription(body, { color: Color.MILITARY_GREEN })
            .setDepth(depth + 1);
        return { container, text };
    }

    /** coin haut gauche du popup = coin haut droit de la maîtrise (retourné à gauche si ça déborde) */
    private showPopup(title: string, body: string, anchor: GridArea): void {
        this.hidePopup();
        const a = this.area!;
        const w = Math.min(a.width * 0.35, 320);
        const h = Math.min(a.height * 0.3, 200);
        let x = anchor.x + anchor.width;
        if (x + w > a.x + a.width) x = anchor.x - w;
        const y = Math.min(anchor.y, a.y + a.height - h);
        this.popup = this.makeOverlay(new GridArea(x, y, w, h), title, body, POPUP_DEPTH);
    }

    private hidePopup(): void {
        this.popup?.container.destroy();
        this.popup?.text.destroy();
        this.popup = undefined;
    }

    private toggleHelp(): void {
        if (this.help) {
            this.hideHelp();
            return;
        }
        this.hidePopup();
        this.help = this.makeOverlay(
            this.area!,
            tr("mastery.help.title", "Maîtrises"),
            tr("mastery.help.body", ""),
            HELP_DEPTH,
            () => this.hideHelp(),
        );
    }

    private hideHelp(): void {
        this.help?.container.destroy();
        this.help?.text.destroy();
        this.help = undefined;
    }
}