
export type Listener<T> = (data?: T) => void;

export class EventEmitter {
    private listeners: { [event: string]: Listener<any>[] } = {};
    public on <T>(eventName: string, listener: Listener<T>): this {
        let list = this.listeners[eventName];
        if (!list) {
             this.listeners[eventName] = list = [];
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
        let list = this.listeners[eventName];
        if (!list) {
             this.listeners[eventName] = list = [];
        }
        list.push(data => {
            this.removeListener(eventName, listener);
            listener(data);
        });
        return this;
    }

    public emit<T>(eventName: string, data?: T) {
        const list = this.listeners[eventName];
        if (!list) {
            if (eventName === 'error') {
                throw data;
            }
            return;
        }
        console.log('emitting even', eventName, this.listeners[eventName]);
        const cpy = [...list];
        for (let i = 0; i < cpy.length; ++i) {
            cpy[i].call(this, data);
        }
    }
}
