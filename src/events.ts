
export type Listener<T> = (data?: T) => void;

export class EventEmitter {
    private listeners: { [event: string]: Listener<any>[] } = {};
    public on <T>(eventName: string, listener: Listener<T>): this {
        let list = this.listeners[eventName];
        if (!list) {
             this.listeners[eventName] = list = [];
        } else if (list.indexOf(listener) !== -1) {
            return this;
        }
        list.push(listener);
        return this;
    }

    public removeListener<T>(eventName: string, listener: Listener<T>) {
        const list = this.listeners[eventName];
        if (!list) {
            return this;
        }
        const idx = list.indexOf(listener);
        if (idx === -1) {
            return this;
        }
        list.splice(idx, 1);
        return this;
    }

    public once<T>(eventName: string, listener: Listener<T>) {
        return this.on<T>(eventName, data => {
            this.removeListener(eventName, listener);
            listener(data);
        });
    }

    public emit<T>(eventName: string, data?: T) {
        const list = this.listeners[eventName];
        if (!list) {
            return;
        }
        const cpy = [...list];
        for (let i = 0; i < cpy.length; ++i) {
            cpy[i](data);
        }
    }
}
