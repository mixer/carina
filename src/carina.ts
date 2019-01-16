import { EventEmitter } from 'events';

import { ConstellationSocket, SocketOptions } from './socket';
import { Subscription } from './subscription';

export { Subscription } from './subscription';
export { State as SocketState } from './socket';
export * from './errors';

const MAX_EVENT_LISTENERS = 30;

export class Carina extends EventEmitter {
    /**
     * Set the websocket implementation.
     * You will likely not need to set this in a browser environment.
     * You will not need to set this if WebSocket is globally available.
     *
     * @example
     * Carina.WebSocket = require('ws');
     */
    public static set WebSocket(ws: any) {
        ConstellationSocket.WebSocket = ws;
    }

    public static get WebSocket() {
        return ConstellationSocket.WebSocket;
    }

    public socket: ConstellationSocket;
    private subscriptions: { [key: string]: Subscription<any> } = Object.create(null);

    constructor(options: Partial<SocketOptions> = {}) {
        super();
        this.setMaxListeners(MAX_EVENT_LISTENERS);
        this.socket = new ConstellationSocket(options);
        this.socket.on('error', (err: any) => this.emit('error', err));
    }

    /**
     * Sets the given options on the socket.
     */
    public setOptions(options: Partial<SocketOptions>) {
        this.socket.setOptions(options);
    }

    /**
     * Boots the connection to constellation.
     */
    public open(): this {
        this.socket.connect();
        return this;
    }

    /**
     * Frees resources associated with the Constellation connection.
     */
    public close() {
        this.socket.close();
    }

    /**
     * @callback onSubscriptionCb
     * @param {Object} data - The payload for the update.
     */

    /**
     * Subscribe to a live event
     *
     * @param {string} slug
     * @param {onSubscriptionCb} cb - Called each time we receive an event for this slug.
     * @returns {Promise.<>} Resolves once subscribed. Any errors will reject.
     */
    public subscribe<T>(slug: string, cb: (data: T) => void): Promise<void> {
        let subscription = this.subscriptions[slug];
        if (!subscription) {
            subscription = this.subscriptions[slug]
                = new Subscription<T>(this.socket, slug, err => this.emit('error', err));
        }

        subscription.add(cb);
        return Promise.resolve(); // backwards-compat
    }

    /**
     * Unsubscribe from a live event.
     *
     * @param {string} slug
     * @returns {Promise.<>} Resolves once unsubscribed. Any errors will reject.
     */
    public unsubscribe(slug: string, listener?: (data: any) => void): Promise<void> {
        const subscription = this.subscriptions[slug];
        if (!subscription) {
            return Promise.resolve();
        }

        if (listener) {
            subscription.remove(listener);
        } else {
            subscription.removeAll();
        }

        if (subscription.listenerCount() === 0) {
            delete this.subscriptions[slug];
        }

        return Promise.resolve(); // backwards-compat
    }
}
