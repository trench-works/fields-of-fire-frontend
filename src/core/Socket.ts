const SOCKET_SERVER_URL = "http://localhost:3000";

type InputAction = { actionId: string; payload: any };

type Listener<PayloadType = any, ResponseType = any> = (
    payload: PayloadType
) => ResponseType;

export class Socket<RessourceKey extends { [key: string]: any } = {}> {
    private socket: WebSocket;

    private listeners: Map<string, Listener[]> = new Map();

    constructor(
        topic: string,
        private readonly userId: string,
        private readonly key: RessourceKey
    ) {
        this.socket = new WebSocket(`${SOCKET_SERVER_URL}/${topic}`);
        this.socket.addEventListener("open", this.onOpen.bind(this));
        this.socket.addEventListener("message", this.handleMessage.bind(this));
    }

    private onOpen() {
        this.send("subscribe", { user: { id: this.userId }, key: this.key });
    }

    send(action: string, payload: any): void {
        this.socket.send(JSON.stringify({ actionId: action, payload }));
    }

    private handleMessage({
        data: { actionId, payload },
    }: MessageEvent<InputAction>) {
        const listeners = this.listeners.get(actionId);
        if (listeners) {
            for (const listener of listeners) {
                listener(payload);
            }
        }
    }

    on<PayloadType = any>(action: string, listener: Listener<PayloadType>) {
        const currentListeners = this.listeners.get(action);
        if (currentListeners) {
            currentListeners.push(listener);
        } else {
            this.listeners.set(action, [listener]);
        }
    }

    onClose(listener: (event: CloseEvent) => any) {
        this.socket.addEventListener("close", listener);
    }
}

