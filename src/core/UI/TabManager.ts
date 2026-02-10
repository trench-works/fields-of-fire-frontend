import { uiGrid } from "../Utils";
import { Button } from "./Button";

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

        scene.add.existing(this)
        
        this.createTabs(tabsConfig);
    }

    private createTabs(tabsConfig: TabConfig[]) {
    let x = 50;

    const grid = uiGrid(0, 0); 
    const barWidth = grid.cellW * 6; // 6 cases de large 
    const barHeight = 40;

    const bar = this.scene.add.container(0, 0); this.add(bar);

    // --- BOUTONS --- 
     const btnWidth = barWidth / tabsConfig.length; 
     const btnHeight = barHeight;
    
    tabsConfig.forEach((tab, index) => {
        const btn = new Button(this.scene, {
            x: index * btnWidth,
            y: 0,
            width: btnWidth,
            height: btnHeight,
            text: tab.label,
            borderWidth: 2,
            borderColor: "#2A4237",
            colorOnOver: "#2A4237",
            onClick: () => this.switchTo(index),
        });

        // AJOUTER LE BOUTON AU CONTAINER
         bar.add(btn);

        const content = this.scene.add.container(0, 80);
        content.setVisible(false);

        tab.build(content);

        // AJOUTER LE CONTENU AU CONTAINER
        this.add(content);

        this.tabs.push(btn);
        this.contents.push(content);

        x += 140;
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
