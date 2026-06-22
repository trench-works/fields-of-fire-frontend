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
    public isError: boolean;

    private socket: WebSocket | undefined = undefined;
    private listeners: Map<OutputActions, SocketListener[]> = new Map();

    private userId: string | undefined;
    private key: RessourceKey | undefined;

    private onCloseListeners: (() => void)[];
    private onSubscribedListeners: (() => void)[];

    constructor(private readonly topic: string) {
        this.isError = false;
        this.onCloseListeners = [];
        this.onSubscribedListeners = [];
    }

    protected open(key: RessourceKey) {
        this.userId = global.user?.id;
        this.key = key;
        this.createSocket();
    }

    private createSocket() {
        this.socket = new WebSocket(
            `${global.config.server.protocols.ws}://${global.config.server.url}:${global.config.server.port}/${this.topic}`,
        );
        this.socket.addEventListener("open", this.handleOpen.bind(this));
        this.socket.addEventListener("message", this.handleMessage.bind(this));
        this.socket.addEventListener("close", this.handleClose.bind(this));
        this.socket.addEventListener("error", this.handleError.bind(this));
    }

    private handleError() {
        if (this.isError === false) {
            this.isError = true;
            this.createSocket();
        } else {
            this.onCloseListeners.forEach((listener) => listener());
        }
    }

    private handleClose() {
        if (this.isError === false) {
            this.onCloseListeners.forEach((listener) => listener());
        }
    }

    private handleOpen() {
        this.isError = false;
        this.send("subscribe" as InputActions, {
            user: { id: this.userId },
            key: this.key,
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async send<PayloadType = any>(
        action: InputActions,
        payload?: PayloadType,
    ): Promise<Error | void> {
        return new Promise<void>((resolve) => {
            if (this.socket?.readyState !== WebSocket.OPEN) {
                console.error("Socket is not connected yet...");
                return new Error("Socket is not connected yet...");
            }
            console.log("CALL SERVER WITH MESSAGE", this.key, action, payload);
            this.socket.send(
                JSON.stringify({ actionId: action, payload: payload ?? {} }),
            );
            resolve();
        });
    }

    private handleMessage({ data }: MessageEvent) {
        const { payload, actionId }: InputAction<OutputActions> =
            JSON.parse(data);
        if (actionId === "subscribed") {
            this.onSubscribedListeners.forEach((listener) => listener());
        } else {
            const listeners = this.listeners.get(actionId);
            if (listeners) {
                for (const listener of listeners) {
                    listener(payload);
                }
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

    onSubscribed(listener: () => void): Error | void {
        this.onSubscribedListeners.push(listener);
    }

    onClose(listener: () => void): Error | void {
        this.onCloseListeners.push(listener);
    }

    close(): Error | void {
        if (!this.socket) {
            return new Error("Socket is not connected yet...");
        }
        this.socket.close();
    }
}

