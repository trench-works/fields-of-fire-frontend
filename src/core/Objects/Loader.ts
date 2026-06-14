import { CustomContainer, DisplayRoot, DisplayText } from "../UI";
import { Grid } from "../Utils";
import { BaseScene } from "./BaseScene";

export class Loader {
    root: DisplayRoot;
    text: DisplayText;

    constructor(private readonly scene: BaseScene) {
        this.root = new DisplayRoot();
        this.watch();
    }

    watch() {
        this.scene.load.on("progress", (value: number) => {
            this.progress(value);
        });
        this.scene.load.on("complete", () => this.destroy());

        const screenGrid = new Grid({
            division: { vertical: 3, horizontal: 3 },
        });

        this.root.add(
            new CustomContainer(
                this.scene,
                screenGrid.getArea({
                    x: 1,
                    y: 1,
                    width: 3,
                    height: 3,
                }),
                {
                    bgColor: "#000000",
                },
            ),
        );
        this.text = new DisplayText(
            this.scene,
            screenGrid.getArea({
                x: 2,
                y: 2,
                width: 1,
                height: 1,
            }),
        ).setText(`Loading ... : ${0}%`);
        this.root.add(this.text);
    }

    progress(value: number) {
        this.text.setText(
            `Loading ... : ${Number.parseInt(String(value * 100))}%`,
        );
    }

    destroy() {
        this.scene.load.removeAllListeners();
        this.root.destroy();
    }
}

