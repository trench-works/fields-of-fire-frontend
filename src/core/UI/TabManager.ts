import { BaseScene } from "../Objects";
import { Grid, GridArea } from "../Utils";
import { Button } from "./Button";
import { CustomContainer } from "./Container";
import { DisplayRoot } from "./DisplayRoot";

export type TabConfig = {
    label: string;
    build: (root: DisplayRoot, area: GridArea) => void;
};

export class TabManager {
    public tabs: Button[];
    public contents: DisplayRoot[];
    public activeTab: number | null;

    constructor(
        protected readonly scene: BaseScene,
        protected readonly rootGrid: Grid,
        tabsConfig: TabConfig[],
    ) {
        this.scene = scene;
        this.tabs = [];
        this.contents = [];
        this.activeTab = null;

        this.createTabs(tabsConfig);
    }

    private createTabs(tabsConfig: TabConfig[]) {
        const contentArea = this.rootGrid.getArea({
            x: 1,
            y: 2,
            width: 3,
            height: this.rootGrid.options.division.vertical - 1,
        });

        tabsConfig.forEach((tab, index) => {
            const tabRoot = new DisplayRoot();
            const btnArea = this.rootGrid.getArea({
                x: index + 1,
                y: 1,
                width: 1,
                height: 1,
            });
            const btn = new Button(this.scene, {
                x: btnArea.center.x,
                y: btnArea.center.y,
                width: btnArea.width,
                height: btnArea.height,
                text: tab.label,
                borderWidth: 5,
                borderColor: "#2A4237",
                onClick: () => this.switchTo(index),
            });

            tabRoot.add(new CustomContainer(this.scene, contentArea, {}));

            // Construire le contenu réel
            tab.build(tabRoot, contentArea);

            this.tabs.push(btn);
            this.contents.push(tabRoot);
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

