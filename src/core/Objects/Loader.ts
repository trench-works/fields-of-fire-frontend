import { i18n } from "../i18n";
import { DisplayContainer, DisplayRoot, DisplayText } from "../UI";
import { Depth, Grid, UI_LEVELS_OFFSET } from "../Utils";
import { BaseScene } from "./BaseScene";

export class Loader {
    root: DisplayRoot;
    text!: DisplayText;

    constructor(
        protected readonly scene: BaseScene,
        protected readonly getProgressText: (progress: number) => string,
        protected readonly offset:
            | UI_LEVELS_OFFSET.LOADER_1
            | UI_LEVELS_OFFSET.LOADER_2,
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
            ).setDepth(Depth.getUIElementDepth(this.offset)),
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
            .setDepth(Depth.getUIElementDepth(this.offset) + 1);
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
        super(
            scene,
            (progress) =>
                `${i18n.translate("loader.assets")} ... : ${progress}%`,
            UI_LEVELS_OFFSET.LOADER_2,
        );
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
            (progress) =>
                `${i18n.translate("loader.connect")} ... : ${progress}%`,
            UI_LEVELS_OFFSET.LOADER_1,
        );
        this.watch();
    }

    watch() {
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

