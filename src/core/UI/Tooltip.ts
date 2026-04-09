import Phaser from "phaser";
import { Color } from "../../config/ColorConfig";
import { ColorUtils } from "../Utils";

interface TooltipConfig {
    bgColor?: string;
    textColor?: string;
    fontSize?: number;
    padding?: number;
    borderColor?: string;
    borderWidth?: number;
    offsetX?: number;
    offsetY?: number;
    maxWidth?: number;
    /** Délai avant affichage en ms (défaut : 2000) */
    delay?: number;
}

/**
 * Tooltip singleton attaché à une scène.
 * Utilisation :
 *   const tooltip = Tooltip.getInstance(this);
 *   tooltip.attachTo(gameObject, "Nom affiché");
 *   tooltip.attachTo(gameObject, "Nom affiché", 500); // délai custom en ms
 */
export class Tooltip extends Phaser.GameObjects.Container {
    private static instances: Map<Phaser.Scene, Tooltip> = new Map();

    private bg: Phaser.GameObjects.Graphics;
    private label: Phaser.GameObjects.Text;
    private cfg: Required<TooltipConfig>;

    /** Timer Phaser en cours (pour pouvoir l'annuler) */
    private showTimer: Phaser.Time.TimerEvent | null = null;

    private constructor(scene: Phaser.Scene, config: TooltipConfig = {}) {
        super(scene, 0, 0);

        this.cfg = {
            bgColor: config.bgColor ?? Color.containerBg ?? "#1a1a2e",
            textColor: config.textColor ?? "#FFFFFF",
            fontSize: config.fontSize ?? 14,
            padding: config.padding ?? 10,
            borderColor: config.borderColor ?? Color.containerBorder ?? "#4a7eb0",
            borderWidth: config.borderWidth ?? 1,
            offsetX: config.offsetX ?? 12,
            offsetY: config.offsetY ?? -20,
            maxWidth: config.maxWidth ?? 200,
            delay: config.delay ?? 2000,
        };

        this.bg = scene.make.graphics({}, false);
        this.label = scene.add
            .text(this.cfg.padding, this.cfg.padding, "", {
                font: `${this.cfg.fontSize}px Arial`,
                color: this.cfg.textColor,
                wordWrap: { width: this.cfg.maxWidth - this.cfg.padding * 2 },
            })
            .setOrigin(0, 0);

        this.add([this.bg, this.label]);
        this.setDepth(9999);
        this.setVisible(false);
        this.setScrollFactor(0);

        scene.add.existing(this);

        scene.events.on("update", this.followPointer, this);
        scene.events.once("shutdown", () => this.destroy(), this);
    }

    /**
     * Récupère (ou crée) l'instance unique pour cette scène.
     * Doit être appelé depuis create() ou après, jamais dans le constructeur de la scène.
     */
    public static getInstance(scene: Phaser.Scene, config?: TooltipConfig): Tooltip {
        if (!scene.sys || !scene.sys.displayList) {
            throw new Error(
                "scene must be initialized before calling getInstance()"
            );
        }
        if (!Tooltip.instances.has(scene)) {
            const instance = new Tooltip(scene, config);
            Tooltip.instances.set(scene, instance);
        }
        return Tooltip.instances.get(scene)!;
    }

    /**
     * Attache un tooltip sur n'importe quel GameObject interactif.
     * @param target  - L'objet sur lequel écouter le hover
     * @param text    - Texte à afficher
     * @param delay   - Délai en ms (surcharge le délai global configuré)
     */
    public attachTo(
        target: Phaser.GameObjects.GameObject,
        text: string,
        delay?: number,
    ): void {
        const effectiveDelay = delay ?? this.cfg.delay;

        target.on("pointerover", () => this.scheduleShow(text, effectiveDelay));
        target.on("pointerout", () => this.cancelAndHide());
    }

    /** Planifie l'affichage après le délai */
    private scheduleShow(text: string, delay: number): void {
        this.cancelTimer();

        if (delay <= 0) {
            this.show(text);
            return;
        }

        this.showTimer = this.scene.time.delayedCall(delay, () => {
            this.show(text);
        });
    }

    /** Annule le timer en attente et cache le tooltip */
    private cancelAndHide(): void {
        this.cancelTimer();
        this.hide();
    }

    private cancelTimer(): void {
        if (this.showTimer) {
            this.showTimer.remove(false);
            this.showTimer = null;
        }
    }

    private show(text: string): void {
        this.label.setText(text);

        const pad = this.cfg.padding;
        const w = this.label.width + pad * 2;
        const h = this.label.height + pad * 2;

        this.bg.clear();
        // Ombre
        this.bg.fillStyle(0x000000, 0.4);
        this.bg.fillRoundedRect(2, 2, w, h, 6);
        // Fond
        this.bg.fillStyle(ColorUtils.parseColor(this.cfg.bgColor), 0.92);
        this.bg.fillRoundedRect(0, 0, w, h, 6);
        // Bordure
        if (this.cfg.borderWidth > 0) {
            this.bg.lineStyle(
                this.cfg.borderWidth,
                ColorUtils.parseColor(this.cfg.borderColor),
                1,
            );
            this.bg.strokeRoundedRect(0, 0, w, h, 6);
        }

        this.setVisible(true);
    }

    private hide(): void {
        this.setVisible(false);
    }

    private followPointer(): void {
        if (!this.visible) return;
        const pointer = this.scene.input.activePointer;

        let px = pointer.x + this.cfg.offsetX;
        let py = pointer.y + this.cfg.offsetY;

        const tooltipW = this.label.width + this.cfg.padding * 2;
        const tooltipH = this.label.height + this.cfg.padding * 2;

        if (px + tooltipW > this.scene.scale.width) {
            px = pointer.x - tooltipW - this.cfg.offsetX;
        }
        if (py + tooltipH > this.scene.scale.height) {
            py = pointer.y - tooltipH - Math.abs(this.cfg.offsetY);
        }
        if (py < 0) py = 0;

        this.setPosition(px, py);
    }

    public destroy(fromScene?: boolean): void {
        this.cancelTimer();
        this.scene?.events.off("update", this.followPointer, this);
        Tooltip.instances.delete(this.scene);
        super.destroy(fromScene);
    }
}