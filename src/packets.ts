import { EventEmitter } from 'events';

export enum PacketState {
    // The packet has not been sent yet, it may be queued for later sending
    Pending = 1,
    // The packet has been sent over the websocket successfully and we are
    // waiting for a reply.
    Sending,
    // The packet was replied to, and has now been complete.
    Replied
}

/**
 * A Packet is a data type that can be sent over the wire to Constellation.
 */
export class Packet extends EventEmitter {
    private static packetIncr = 0;

    private state: PacketState = PacketState.Pending;
    private timeout: number | undefined;
    private data: {
        type: 'method';
        id: number;
        method: string;
        params: { [key: string]: any } | null;
    };

    constructor(method: string, params: { [key: string]: any } | null) {
        super();
        this.data = {
            id: Packet.packetIncr++,
            type: 'method',
            method,
            params,
        };
    }

    /**
     * Returns the randomly-assigned numeric ID of the packet.
     * @return {number}
     */
    id(): number {
        return this.data.id;
    }

    /**
     * toJSON implements is called in JSON.stringify.
     */
    toJSON(): { [key: string]: any } {
        return this.data;
    }

    /**
     * Sets the timeout duration on the packet. It defaults to the socket's
     * timeout duration.
     */
    setTimeout(duration: number) {
        this.timeout = duration;
    }

    /**
     * Returns the packet's timeout duration, or the default if undefined.
     */
    getTimeout(defaultTimeout: number): number {
        return this.timeout || defaultTimeout;
    }

    /**
     * Returns the current state of the packet.
     * @return {PacketState}
     */
    getState(): PacketState {
        return this.state;
    }

    /**
     * Updates the state of the packet.
     * @param {PacketState} state
     */
    setState(state: PacketState) {
        if (state === this.state) {
            return;
        }

        this.state = state;
    }
}


/**
 * Call represents a Constellation method call.
 */
export class Call extends Packet {
}
