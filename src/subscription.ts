import { ConstellationSocket, State } from './socket';
import { CancelledError } from './errors';

/**
 * Subscription is attached to a socket and tracks listening functions.
 */
export class Subscription<T> {

    private listeners: ((data: T) => void)[] = [];
    private socketStateListener: (state: State) => void;
    private socketDataListener: (ev: { channel: string, payload: T }) => void;

    constructor(
        private socket: ConstellationSocket,
        private slug: string,
        private onError: (err: Error) => void,
    ) {}

    /**
     * add inserts the listener into the subscription
     */
    public add(listener: (data: T) => void): void {
        if (this.listeners.length === 0) {
            this.addSocketListener();
        }

        this.listeners.push(listener);
    }

    /**
     * remove removes the listening function.
     */
    public remove(listener: (data: T) => void): void {
        this.listeners = this.listeners.filter(l => l !== listener);
        if (this.listeners.length === 0) {
            this.removeSocketListener();
        }
    }

    /**
     * removeAll destroys all listening functions and unsubscribes from the socket.
     */
    public removeAll(): void {
        this.listeners = [];
        this.removeSocketListener();
    }

    /**
     * Returns the number of listening functions attached to the subscription.
     */
    public listenerCount(): number {
        return this.listeners.length;
    }

    private addSocketListener() {
        this.socketStateListener = state => {
            if (state === State.Connected) {
                this.socket
                    .execute('livesubscribe', { events: [this.slug] })
                    .catch(err => {
                        if (!(err instanceof CancelledError)) {
                            this.onError(err);
                        }
                    });
            }
        };

        this.socketDataListener = ev => {
            if (ev.channel === this.slug) {
                this.listeners.forEach(l => l(ev.payload));
            }
        };

        this.socket.on('state', this.socketStateListener);
        this.socket.on('event:live', this.socketDataListener);
        this.socketStateListener(this.socket.getState());
    }

    private removeSocketListener() {
        if (!this.socketStateListener) {
            return;
        }

        if (this.socket.getState() === State.Connected) {
            this.socket
                .execute('liveunsubscribe', { events: [this.slug] })
                .catch(() => undefined); // don't care about anything here
        }

        this.socket.removeListener('state', this.socketStateListener);
        this.socket.removeListener('event:live', this.socketDataListener);
        this.socketStateListener = null;
        this.socketDataListener = null;
    }
}
