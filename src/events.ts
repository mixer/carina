
export type Listener<T> = (data?: T) => void;
interface IWrappedListener<T> {
    (data?: T): void;
    listener: (data?: T) => void;
}

export class EventEmitter {
    private listeners: { [event: string]: (Listener<any> | IWrappedListener<any>)[] } = {};
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
        let idx = -1;
        for (let i = 0; i < list.length; ++i) {
            const _listener = <IWrappedListener<T>>list[i];
            if (_listener === listener || _listener.listener === listener) {
                idx = i;
                break;
            }
        }
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
        const wrappedFn = <IWrappedListener<T>>(data => {
            this.removeListener(eventName, wrappedFn);
            listener(data);
        });
        wrappedFn.listener = listener;
        list.push(wrappedFn);
        return this;
    }

    public emit<T>(eventName: string, data?: T) {
        const list = this.listeners[eventName];
        if (!list) {
            if (eventName === 'error') {
                throw data;
            }
            return false;
        }
        const cpy = [...list];
        for (let i = 0; i < cpy.length; ++i) {
            cpy[i].call(this, data);
        }
        return true;
    }
}
