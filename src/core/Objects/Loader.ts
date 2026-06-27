import { DisplayContainer, DisplayRoot, DisplayText } from "../UI";
import { Depth, Grid, UI_LEVELS_OFFSET } from "../Utils";
import { BaseScene } from "./BaseScene";

export class Loader {
    root: DisplayRoot;
    text!: DisplayText;

    constructor(
        protected readonly scene: BaseScene,
        protected readonly getProgressText: (progress: number) => string,
    ) {
        this.root = new DisplayRoot();
    }

    watch() {
        const screenGrid = new Grid({
            division: { vertical: 3, horizontal: 3 },
        });

        this.root.add(
            new DisplayContainer(
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
            ).setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.LOADER)),
        );
        this.text = new DisplayText(
            this.scene,
            screenGrid.getArea({
                x: 2,
                y: 2,
                width: 1,
                height: 1,
            }),
        )
            .setText(this.getProgressText(0))
            .setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.LOADER) + 1);
        this.root.add(this.text);
    }

    progress(value: number) {
        this.text.setText(
            this.getProgressText(Number.parseInt(String(value * 100))),
        );
    }

    destroy() {
        this.root.destroy();
    }
}

export class AssetLoader extends Loader {
    constructor(scene: BaseScene) {
        super(scene, (progress) => `Loading Assets ... : ${progress}%`);
        this.watch();
    }

    watch() {
        this.scene.load.on("progress", (value: number) => {
            this.progress(value);
        });
        this.scene.load.on("complete", () => this.destroy());
        super.watch();
    }

    destroy() {
        this.scene.load.removeAllListeners();
        super.destroy();
    }
}

export interface ConnectionListener {
    onConnectionProgress: (listener: (value: number) => void) => void;
    onConnectionComplete: (listener: () => void) => void;
    removeConnectionListener: () => void;
}

export class ConnectionLoader extends Loader {
    constructor(
        scene: BaseScene,
        protected readonly connecter: ConnectionListener,
    ) {
        super(
            scene,
            (progress) => `Waiting for players to connect ... : ${progress}%`,
        );
        this.watch();
    }

    watch() {
        console.log(this.connecter);
        this.connecter.onConnectionProgress((value: number) => {
            this.progress(value);
        });
        this.connecter.onConnectionComplete(() => {
            this.destroy();
        });
        super.watch();
    }

    destroy() {
        this.connecter.removeConnectionListener();
        super.destroy();
    }
}

