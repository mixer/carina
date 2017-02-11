import { EventEmitter } from './events';
import { EventTimeoutError } from './errors';

/**
 * Returns a promise that's resolved when an event is emitted on the
 * EventEmitter.
 */
export function resolveOn<T>(emitter: EventEmitter, event: string,
    timeout: number = 120 * 1000): Promise<T> {

    return new Promise((resolve, reject) => {
        let timer: number | NodeJS.Timer;
        const listener = (data: T) => {
            clearTimeout(<number>timeout);
            resolve(data);
        };

        emitter.once(event, listener);

        timer = setTimeout(() => {
            emitter.removeListener(event, listener);
            reject(new EventTimeoutError(event));
        }, timeout);
    });
}
