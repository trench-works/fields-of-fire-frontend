// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InputAction<Actions> = { actionId: Actions; payload: any };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SocketListener<PayloadType = any> = (payload: PayloadType) => void;

export class Socket<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    RessourceKey extends { [key: string]: any } = any,
    InputActions = string,
    OutputActions = string,
> {
    private socket: WebSocket | undefined = undefined;
    private listeners: Map<OutputActions, SocketListener[]> = new Map();

    private userId: string | undefined;
    private key: RessourceKey | undefined;

    constructor(private readonly topic: string) {}

    protected open(key: RessourceKey) {
        this.userId = global.config.user.id;
        this.key = key;
        this.socket = new WebSocket(
            `ws://${global.config.server.url}:${global.config.server.port}/${this.topic}`,
        );
        this.socket.addEventListener("open", this.onOpen.bind(this));
        this.socket.addEventListener("message", this.handleMessage.bind(this));
    }

    private onOpen() {
        this.send("subscribe" as InputActions, {
            user: { id: this.userId },
            key: this.key,
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    send<PayloadType = any>(
        action: InputActions,
        payload: PayloadType,
    ): Error | void {
        if (!this.socket) {
            return new Error("Socket is not connected yet...");
        }
        this.socket.send(JSON.stringify({ actionId: action, payload }));
    }

    private handleMessage({ data }: MessageEvent) {
        const { payload, actionId }: InputAction<OutputActions> =
            JSON.parse(data);
        const listeners = this.listeners.get(actionId);
        if (listeners) {
            for (const listener of listeners) {
                listener(payload);
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    on<PayloadType = any>(
        action: OutputActions,
        listener: SocketListener<PayloadType>,
    ) {
        const currentListeners = this.listeners.get(action);
        if (currentListeners) {
            currentListeners.push(listener);
        } else {
            this.listeners.set(action, [listener]);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onClose(listener: (event: CloseEvent) => any): Error | void {
        if (!this.socket) {
            return new Error("Socket is not connected yet...");
        }
        this.socket.addEventListener("close", listener);
    }

    close(): Error | void {
        if (!this.socket) {
            return new Error("Socket is not connected yet...");
        }
        this.socket.close();
    }
}

