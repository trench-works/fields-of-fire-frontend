import { Grid } from "../Utils";
import { Button } from "./Button";
import { CustomContainer } from "./Container";

export type TabConfig = {
    label: string;
    build: (container: Phaser.GameObjects.Container) => void;
};

export class TabManager extends Phaser.GameObjects.Container {
    public scene: Phaser.Scene;
    public tabs: Button[];
    public contents: Phaser.GameObjects.Container[];
    public activeTab: number | null;

    constructor(scene: Phaser.Scene, tabsConfig: TabConfig[]) {
        super(scene, 0, 0);
        this.scene = scene;
        this.tabs = [];
        this.contents = [];
        this.activeTab = null;

        scene.add.existing(this);

        this.createTabs(tabsConfig);
    }

    private createTabs(tabsConfig: TabConfig[]) {
        const grid = new Grid();
        const barWidth = grid.cell.width * 6;
        const barHeight = 40;

        const bar = this.scene.add.container(0, 0);
        this.add(bar);

        const btnWidth = barWidth / tabsConfig.length;
        const btnHeight = barHeight;

        tabsConfig.forEach((tab, index) => {
            const btn = new Button(this.scene, {
                x: index * btnWidth,
                y: 0,
                width: btnWidth,
                height: btnHeight,
                text: tab.label,
                borderWidth: 5,
                borderColor: "#2A4237",
                colorOnOver: "#2A4237",
                onClick: () => this.switchTo(index),
            });

            bar.add(btn);

            const contentArea = new Grid().getArea(0, 0, 6, 8); // <-- 6 colonnes × 7 lignes

            // Container de contenu
            const offsetX = -btnWidth / 2;
            const offsetY = btnHeight / 2;
            const content = this.scene.add.container(
                contentArea.x + offsetX,
                contentArea.y + offsetY,
            );

            content.setSize(contentArea.width, contentArea.height);
            content.setVisible(false);

            // --- DEBUG VISUEL : CustomContainer en fond ---
            const debugBg = new CustomContainer(this.scene, {
                title: "",
                x: contentArea.width / 2,
                y: contentArea.height / 2,
                width: contentArea.width,
                height: contentArea.height,
            });

            content.add(debugBg);

            // Construire le contenu réel
            tab.build(content);

            this.add(content);

            this.tabs.push(btn);
            this.contents.push(content);
        });

        this.switchTo(0);
    }

    switchTo(index: number) {
        if (this.activeTab === index) return;
        // Masquer tous les contenus
        this.contents.forEach((c) => c.setVisible(false));
        // Afficher le contenu actif
        this.contents[index].setVisible(true);
        // Mettre à jour le style visuel
        this.tabs.forEach((tab, i) => {
            tab.setBackgroundColor(i === index ? "#2A4237" : "#D4D2B8");
        });
        this.activeTab = index;
    }
}

