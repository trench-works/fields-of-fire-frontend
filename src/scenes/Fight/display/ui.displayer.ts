import { Color } from "../../../config/ColorConfig";
import {
    Button,
    Depth,
    Displayer,
    i18n,
    UI_LEVELS_OFFSET,
} from "../../../core";
import { FightScene } from "../fight.scene";

export class UIDisplayer extends Displayer<FightScene> {
    protected resetButton!: Button;

    constructor(
        // Scene
        scene: FightScene,
    ) {
        super(scene);
    }

    preRender(): this {
        const actionArea = this.scene.rootGrid.getSubGrid(
            {
                x: 3,
                y: 8,
                width: 5,
                height: 1,
            },
            { division: { horizontal: 6, vertical: 2 } },
        );
        this.resetButton = new Button(
            this.scene,
            actionArea.getArea({
                x: 1,
                y: 2,
                width: 2,
                height: 1,
            }),
            {
                text: i18n.translate("fight.ui.reset"),
                borderColor: Color.MILITARY_GREEN,
                borderWidth: 2,
                onClick: () => {
                    this.scene.root.controllers.grid.resetGrid();
                },
            },
        ).setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.BUTTON));
        return this;
    }

    render(): this {
        throw new Error("Method not implemented.");
    }

    update(): this {
        throw new Error("Method not implemented.");
    }

    animate(): Promise<this> {
        throw new Error("Method not implemented.");
    }
}

