import { ConnectionListener } from "../../../core/Objects/Loader";
import { FightSceneRoot } from "../fight-scene.root";
import { GamePlayerEvents } from "./player.socket";

export class ConnectingRepository implements ConnectionListener {
    constructor(private readonly root: FightSceneRoot) {}

    onConnectionProgress(listener: (value: number) => void) {
        this.root.playerSocket?.on<{ progress: number }>(
            GamePlayerEvents.CONNECTION_UPDATE,
            ({ progress }) => listener(progress),
        );
    }

    onConnectionComplete(listener: () => void) {
        this.root.playerSocket?.on<{ progress: number }>(
            GamePlayerEvents.CONNECTION_UPDATE,
            ({ progress }) => {
                console.log("progress", progress);
                if (progress === 1) {
                    listener();
                }
            },
        );
    }

    removeConnectionListener() {
        console.log("WILL REMOVE LISTENERS NOW");
        this.root.playerSocket?.removeListeners(
            GamePlayerEvents.CONNECTION_UPDATE,
        );
    }
}

