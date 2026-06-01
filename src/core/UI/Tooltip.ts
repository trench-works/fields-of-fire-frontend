import Phaser from "phaser";
import { Color } from "../../config/ColorConfig";
import { ColorUtils } from "../Utils";

interface TooltipConfig {
    bgColor?: string;
    textColor?: string;
    titleColor?: string;
    fontSize?: number;
    titleFontSize?: number;
    padding?: number;
    borderColor?: string;
    borderWidth?: number;
    offsetX?: number;
    offsetY?: number;
    maxWidth?: number;
    delay?: number;
}

export class Tooltip extends Phaser.GameObjects.Container {
    private static instances: Map<Phaser.Scene, Tooltip> = new Map();

    private bg: Phaser.GameObjects.Graphics;
    private titleLabel: Phaser.GameObjects.Text;
    private bodyLabel: Phaser.GameObjects.Text;
    private cfg: Required<TooltipConfig>;
    private showTimer: Phaser.Time.TimerEvent | null = null;

    private constructor(scene: Phaser.Scene, config: TooltipConfig = {}) {
        super(scene, 0, 0);

        this.cfg = {
            bgColor:       config.bgColor       ?? Color.containerBg,
            textColor:     config.textColor      ?? "#FFFFFF",
            titleColor:    config.titleColor     ?? Color.btnBg ,
            fontSize:      config.fontSize       ?? 14,
            titleFontSize: config.titleFontSize  ?? 16,
            padding:       config.padding        ?? 10,
            borderColor:   config.borderColor    ?? Color.containerBorder,
            borderWidth:   config.borderWidth    ?? 1,
            offsetX:       config.offsetX        ?? 12,
            offsetY:       config.offsetY        ?? -20,
            maxWidth:      config.maxWidth       ?? 200,
            delay:         config.delay          ?? 2000,
        };

        const pad = this.cfg.padding;

        this.bg = scene.make.graphics({}, false);

        // ✅ Titre (bold, couleur distincte)
        this.titleLabel = scene.add
            .text(pad, pad, "", {
                fontFamily: "MyFont",
                fontSize: this.cfg.titleFontSize + "px",
                color: this.cfg.titleColor,
                fontStyle: "bold",
                wordWrap: { width: this.cfg.maxWidth - pad * 2 },
            })
            .setOrigin(0, 0);

        // ✅ Corps sous le titre
        this.bodyLabel = scene.add
            .text(pad, pad, "", {
                fontFamily: "MyFont",
                fontSize: this.cfg.fontSize + "px",
                color: this.cfg.textColor,
                wordWrap: { width: this.cfg.maxWidth - pad * 2 },
            })
            .setOrigin(0, 0);

        this.add([this.bg, this.titleLabel, this.bodyLabel]);
        this.setDepth(9999);
        this.setVisible(false);
        this.setScrollFactor(0);

        scene.add.existing(this);
        scene.events.on("update", this.followPointer, this);
        scene.events.once("shutdown", () => this.destroy(), this);
    }

    public static getInstance(scene: Phaser.Scene, config?: TooltipConfig): Tooltip {
        if (!scene.sys || !scene.sys.displayList) {
            throw new Error("scene must be initialized before calling getInstance()");
        }
        if (!Tooltip.instances.has(scene)) {
            Tooltip.instances.set(scene, new Tooltip(scene, config));
        }
        return Tooltip.instances.get(scene)!;
    }

    /**
     * Attache un tooltip avec titre optionnel.
     * @param target - L'objet sur lequel écouter le hover
     * @param text   - Texte du corps, ou juste le texte si pas de titre
     * @param title  - Titre affiché en haut (optionnel)
     * @param delay  - Délai en ms (surcharge le délai global)
     */
    public attachTo(
        target: Phaser.GameObjects.GameObject,
        text: string,
        title?: string | number,  // ← garde la compat avec l'ancien usage (delay number)
        delay?: number,
    ): void {
        // ✅ Rétrocompatibilité : si title est un nombre c'est l'ancien paramètre delay
        let resolvedTitle: string | undefined;
        let resolvedDelay: number = delay ?? this.cfg.delay;

        if (typeof title === "number") {
            resolvedDelay = title;
            resolvedTitle = undefined;
        } else {
            resolvedTitle = title;
        }

        target.on("pointerover", () => this.scheduleShow(text, resolvedDelay, resolvedTitle));
        target.on("pointerout",  () => this.cancelAndHide());
    }

    private scheduleShow(text: string, delay: number, title?: string): void {
        this.cancelTimer();
        if (delay <= 0) {
            this.show(text, title);
            return;
        }
        this.showTimer = this.scene.time.delayedCall(delay, () => {
            this.show(text, title);
        });
    }

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

    private show(text: string, title?: string): void {
        const pad = this.cfg.padding;
        const gap = 4; // espace entre titre et corps

        if (title) {
            this.titleLabel.setText(title).setVisible(true);
            this.bodyLabel.setText(text).setVisible(true);
            this.titleLabel.setText(title.charAt(0).toUpperCase() + title.slice(1)).setVisible(true);
            this.bodyLabel.setPosition(pad, pad + this.titleLabel.height + gap);
        } else {
            this.titleLabel.setVisible(false);
            this.bodyLabel.setText(text).setVisible(true);
            this.bodyLabel.setPosition(pad, pad);
        }

        const contentH = title
            ? this.titleLabel.height + gap + this.bodyLabel.height
            : this.bodyLabel.height;

        const w = Math.max(this.titleLabel.width, this.bodyLabel.width) + pad * 2;
        const h = contentH + pad * 2;

        this.bg.clear();
        this.bg.fillStyle(0x000000, 0.4);
        this.bg.fillRoundedRect(2, 2, w, h, 6);
        this.bg.fillStyle(ColorUtils.parseColor(this.cfg.bgColor), 0.92);
        this.bg.fillRoundedRect(0, 0, w, h, 6);
        if (this.cfg.borderWidth > 0) {
            this.bg.lineStyle(this.cfg.borderWidth, ColorUtils.parseColor(this.cfg.borderColor), 1);
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

        const tooltipW = Math.max(this.titleLabel.width, this.bodyLabel.width) + this.cfg.padding * 2;
        const tooltipH = this.titleLabel.height + this.bodyLabel.height + this.cfg.padding * 2;

        if (px + tooltipW > this.scene.scale.width)  px = pointer.x - tooltipW - this.cfg.offsetX;
        if (py + tooltipH > this.scene.scale.height) py = pointer.y - tooltipH - Math.abs(this.cfg.offsetY);
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