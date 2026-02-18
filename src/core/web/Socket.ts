const SOCKET_SERVER_URL = "http://localhost:3000";

type InputAction<Actions> = { actionId: Actions; payload: any };

type Listener<PayloadType = any> = (payload: PayloadType) => void;

export class Socket<
    RessourceKey extends { [key: string]: any } = {},
    InputActions = string,
    OutputActions = string
> {
    private socket: WebSocket | undefined = undefined;
    private listeners: Map<OutputActions, Listener[]> = new Map();

    private userId: string | undefined;
    private key: RessourceKey | undefined;

    constructor(private readonly topic: string) {}

    protected open(userId: string, key?: RessourceKey) {
        this.userId = userId;
        this.key = key;
        this.socket = new WebSocket(`${SOCKET_SERVER_URL}/${this.topic}`);
        this.socket.addEventListener("open", this.onOpen.bind(this));
        this.socket.addEventListener("message", this.handleMessage.bind(this));
    }

    private onOpen() {
        this.send("subscribe" as InputActions, {
            user: { id: this.userId },
            key: this.key,
        });
    }

    send<PayloadType = any>(
        action: InputActions,
        payload: PayloadType
    ): Error | void {
        if (!this.socket) {
            return new Error("Socket is not connected yet...");
        }
        this.socket?.send(JSON.stringify({ actionId: action, payload }));
    }

    private handleMessage({
        data: { actionId, payload },
    }: MessageEvent<InputAction<OutputActions>>) {
        const listeners = this.listeners.get(actionId);
        if (listeners) {
            for (const listener of listeners) {
                listener(payload);
            }
        }
    }

    on<PayloadType = any>(
        action: OutputActions,
        listener: Listener<PayloadType>
    ) {
        const currentListeners = this.listeners.get(action);
        if (currentListeners) {
            currentListeners.push(listener);
        } else {
            this.listeners.set(action, [listener]);
        }
    }

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

