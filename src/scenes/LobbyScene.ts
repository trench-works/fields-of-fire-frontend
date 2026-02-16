import { Button } from "../core/UI/Button";
import { CustomContainer } from "../core/UI/Container";
import { TabManager } from "../core/UI/TabManager";
import { uiGrid } from "../core/Utils";
import { Color } from "../data/ColorConfig";
import { Action } from "../Model/Action";
import { CharacterClass } from "../Model/CharacterClass";
import { PlayableCharacter } from "../Model/PlayableCharacter";
import { Position } from "../Model/Position";
import { Stats } from "../Model/Stats";

export class LobbyScene extends Phaser.Scene {
    private backgroundImage = "red_bg";
    private actions: Action[] = [
        new Action({
            id: "walk",
            name: "Marcher",
            description: "Se déplacer vers une position ciblée",
            iconSpriteKey: "action_image_moove",
            cost: 0,
            isWalkAction: true,
        }),
        new Action({
            id: "shoot",
            name: "Attaquer",
            description: "Attaquer un ennemi à portée",
            iconSpriteKey: "action_image_shoot",
            cost: 2,
        }),
        new Action({
            id: "arrowup",
            name: "Soigner",
            description: "buff un allié",
            iconSpriteKey: "action_image_arrowup",
            cost: 1,
        }),
    ];
    private allExistingClass: CharacterClass[] = [
        new CharacterClass(
            "Fantassin",
            "entente_fantassin",
            "entente_fantassin_spritesheet",
            "entente_fantassin_closeup",
            new Stats({life: 24, precision: 10, strength: 20, accuracy: 100, initiative: 80, dodging: 0, energy: 4, mouvement: 3}),
            "Un soldat polyvalent, capable de s'adapter à différentes situations sur le champ de bataille. Il est équipé d'une armure légère et d'une épée, ce qui lui permet de se déplacer rapidement et d'attaquer efficacement à courte portée. Le Fantassin est également capable d'utiliser des compétences de soutien pour renforcer ses alliés ou affaiblir ses ennemis.",
            this.actions,
        ),
        new CharacterClass(
            "Medic",
            "entente_medic",
            "entente_medic_spritesheet",
            "entente_medic_closeup",
            new Stats({life: 16, precision: 5, strength: 10, accuracy: 100, initiative: 70, dodging: 5, energy: 4, mouvement: 2}),
            "Un soigneur spécialisé dans le soutien de ses alliés. Le Medic est équipé d'une armure légère et d'un pistolet, ce qui lui permet de se déplacer rapidement et d'attaquer à distance. Sa principale force réside dans sa capacité à soigner les blessures de ses alliés et à fournir des buffs pour améliorer leurs performances au combat.",
            this.actions,
        ),
        new CharacterClass(
            "Caporal",
            "entente_caporal",
            "entente_caporal_spritesheet",
            "entente_caporal_closeup",
            new Stats({life: 20, precision: 15, strength: 30, accuracy: 100, initiative: 90, dodging: 5, energy: 4, mouvement: 4}),
            "Un combattant robuste et discipliné, le Caporal est équipé d'une armure lourde et d'une hache, ce qui lui permet de résister aux attaques ennemies et de causer des dégâts importants à courte portée. Il excelle dans les combats rapprochés et peut utiliser des compétences pour augmenter sa défense ou infliger des dégâts supplémentaires à ses adversaires.",
            this.actions,
        ),
    ];
    private currentSelectedClassKey: string | null = "entente_medic";
    private SelectedClass: CharacterClass | null =
        this.allExistingClass.find(
            (charClass) => charClass.imageKey === this.currentSelectedClassKey,
        ) || null;
    private tabWidth!: number;
    private tabHeight!: number;
    private playerImageContainer!: CustomContainer;
    private playerClassName!: CustomContainer;

    constructor() {
        super({ key: "lobbyScene" });
    }

    preload() {
        this.load.image(
            this.backgroundImage,
            `assets/${this.backgroundImage}.jpg`,
        );
        this.allExistingClass.forEach((charClass) => {
            console.log(charClass.imageKey);
            this.load.image(
                charClass.imageKey,
                `assets/${charClass.imageKey}.png`,
            );
            charClass.actionList.forEach((action) => {
                this.load.image(
                    action.props.iconSpriteKey,
                    `assets/${action.props.iconSpriteKey}.png`,
                );
            });
        });
    }

    create() {
        //title BOX
        const titleBox = uiGrid(0, 0);
        const bg = this.add
            .image(0, 0, this.backgroundImage)
            .setOrigin(0, 0)
            .setDepth(-1);
        bg.setDisplaySize(this.scale.width, this.scale.height);
        this.add
            .text(this.scale.width / 2, titleBox.y + 20, "LOBBY", {
                fontSize: "48px",
                color: "#ffffff",
            })
            .setOrigin(0.5, 0);

        //tab BOX
        const tabArea = uiGrid(0, 1);
        const tabPanelWidth = tabArea.cellW * 3;
        const tabPanelHeight = this.scale.height - tabArea.cellH;
        const currenttabPosition = new Position(
            tabArea.x + tabPanelWidth / 2,
            tabArea.y + tabPanelHeight / 2,
        );
        //console.log("TabArea dimensions:", tabArea.cellH, tabArea.cellW, " window, " , window.innerWidth, window.innerHeight);

        this.tabWidth = tabArea.cellW * 2; // colonnes 0 et 1
        this.tabHeight = this.scale.height - tabArea.cellH; // lignes 1 à 8

        console.log(
            "Tab dimensions:",
            this.tabHeight,
            this.tabWidth,
            " window, ",
            window.innerWidth,
            window.innerHeight,
        );

        const tabManager = new TabManager(this, [
            {
                label: "Classes",
                build: (container) => {
                    //container.add(this.add.text(50, 0, "not implemented yet"));
                    this.buildClassesTab(container);
                },
            },
            {
                label: "Maitrises",
                build: (container) => {
                    container.add(
                        this.add.text(50, 0, "not implemented yet", {
                            fontSize: "48px",
                            color: "#ffffff",
                        }),
                    );
                },
            },
            {
                label: "Equipements",
                build: (container) => {
                    container.add(this.add.text(50, 0, "not implemented yet", {
                        fontSize: "48px",
                        color: "#ffffff",
                    }));
                },
            },
        ]);
        tabManager.setPosition(tabArea.x + this.tabWidth / 2, tabArea.y + 20);

        this.events.on("class-selected", (charClass: CharacterClass) => {
            this.SelectedClass = charClass;

            // Rafraîchir l'image du playerPanel
            this.updatePlayerImage();
        });

        //Selected character info BOX
        const area = uiGrid(6, 1);
        const playerPanelWidth = area.cellW * 3;
        const playerPanelHeight = this.scale.height - area.cellH;
        const currentPlayerInfoPosition = new Position(
            area.x + playerPanelWidth / 2,
            area.y + playerPanelHeight / 2,
        );
        const playerPanel = new CustomContainer(this, {
            title: "",
            x: currentPlayerInfoPosition.x,
            y: currentPlayerInfoPosition.y,
            width: playerPanelWidth,
            height: playerPanelHeight,
            borderWidth: 5,
        });

        const playerpanelgrid = uiGrid(
            0,
            0,
            playerPanelWidth,
            playerPanelHeight,
        );

        const imgArea = playerpanelgrid.getArea(0, 0, 5, 5);

        const classNameArea = playerpanelgrid.getArea(0, 5, 9, 0.5);

        const playerNameContainer = new CustomContainer(this, {
            title: this.SelectedClass!.name,
            x: classNameArea.centerX - playerPanelWidth / 2,
            y: classNameArea.centerY - playerPanelHeight / 2 + 10,
            width: classNameArea.width,
            height: classNameArea.height,
            bgColor: Color.containerBorder,
            borderWidth: 5,
        });

        playerPanel.add(playerNameContainer);
        this.playerClassName = playerNameContainer;

        const playerImageContainer = new CustomContainer(this, {
            title: "",
            x: imgArea.centerX - playerPanelWidth / 2 + 10,
            y: imgArea.centerY - playerPanelHeight / 2 + 10,
            width: imgArea.width,
            height: imgArea.height,
            backgroundImage: this.SelectedClass!.imageKey,
            borderWidth: 5,
        });
        playerPanel.add(playerImageContainer);

        this.playerImageContainer = playerImageContainer;

        const buttonArea = playerpanelgrid.getArea(0, 8, 4, 1);

        const fightButton = new Button(this, {
            x: buttonArea.centerX - playerPanelWidth / 2 + 10,
            y: buttonArea.centerY - playerPanelHeight / 2 - 10,
            width: buttonArea.width,
            height: buttonArea.height,
            text: "Combattre",
            color: "#2A4237",
            colorOnOver: "#4a7aa8",
            borderWidth: 2,
            borderColor: "#ffffff",
            onClick: () =>
                this.scene.start("fightScene", {
                    spawnPos: { x: 0, y: 0 },
                    class: this.SelectedClass!,
                    id: "player_1",
                }),
        });
        playerPanel.add(fightButton);
    }

    //  --- ATTENTION !!!
    // cette fonction c'est du bricolage et nécessite un rework futur
    // ne jamais lui donner + de 3 classes sinon EXPLOSION

    private buildClassesTab(container: Phaser.GameObjects.Container) {
        const classes = this.allExistingClass;
        const classesPerRow = 3;
        const contentwidth: number = container.width;
        const grid = uiGrid(
            0,
            0,
            contentwidth,
            this.tabHeight,
            9,
            Math.ceil(classes.length / classesPerRow),
        );

        classes.forEach((charClass, index) => {
            const col = (index % classesPerRow) * 3;
            const row = Math.floor(index / classesPerRow);

            const area = grid.getArea(col, row, 1, 1);

            const x = area.centerX - this.tabWidth / 2 + grid.cellW * 2.5;
            const y = area.centerY - this.tabHeight / 2 + grid.cellH * 0.25;

            console.log(
                `Class ${charClass.name} area:`,
                area,
                " position: ",
                x,
                y,
            );

            const classContainer = new CustomContainer(this, {
                title: "",
                x: x,
                y: y + 10,
                width: grid.cellW * 2,
                height: area.height / 2,
                backgroundImage: charClass.imageKey,
                borderWidth: 7,
                onClick: () => {
                    this.events.emit("class-selected", charClass);
                },
            });
            container.add(classContainer);
        });
    }

    updatePlayerImage() {
        if (!this.SelectedClass) return;

        // Met directement la nouvelle image
        this.playerImageContainer.setBackgroundImage(
            this.SelectedClass.imageKey,
        );

        // Met à jour le nom
        this.playerClassName.setTitle(this.SelectedClass.name);
    }
}
