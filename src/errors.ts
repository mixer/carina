export abstract class CarinaError extends Error {
    constructor(public readonly message: string) {
        super();
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
            return;
        }
        this.stack = new Error().stack;
    }

    protected static setProto (error: CarinaError) {
        if (Object.setPrototypeOf) {
            Object.setPrototypeOf(error, this.prototype);
            return;
        }
        (<any>error).__proto__ = this.prototype; // Super emergency fallback
    }
}

export class CancelledError extends CarinaError {
    constructor() {
        super('Packet was cancelled or Carina was closed before a reply was received.');
        CancelledError.setProto(this);
    }
}

export class EventTimeoutError extends CarinaError {
    constructor (public eventName: string) {
        super(`Timeout out waiting for event ${eventName}`);
        EventTimeoutError.setProto(this);
    }
}

export class MessageParseError extends CarinaError {
    constructor (msg: string) {
        super(msg);
        MessageParseError.setProto(this);
    }
}


export module ConstellationError {
    interface IConstellationErrorCtor {
        new (message: string): ConstellationError;
    }
    export class ConstellationError extends CarinaError {
        constructor(public code: number, message: string) {
            super(message);
            ConstellationError.setProto(this);
        }
    }

    const errors: { [id: number]: IConstellationErrorCtor } = {};

    export function from({ code, message }: { code: number, message: string }) {
        if (errors[code]) {
            return new errors[code](message);
        }

        return new ConstellationError(code, message);
    }

    export class InvalidPayload extends ConstellationError {
        constructor(message: string) {
            super(4000, message);
            InvalidPayload.setProto(this);
        }
    }
    errors[4000] = InvalidPayload;

    export class PayloadDecompression extends ConstellationError {
        constructor(message: string) {
            super(4001, message);
            PayloadDecompression.setProto(this);
        }
    }
    errors[4001] = PayloadDecompression;

    export class UnknownPacketType extends ConstellationError {
        constructor(message: string) {
            super(4002, message);
            UnknownPacketType.setProto(this);
        }
    }
    errors[4002] = UnknownPacketType;

    export class UnknownMethodName extends ConstellationError {
        constructor(message: string) {
            super(4003, message);
            UnknownMethodName.setProto(this);
        }
    }
    errors[4003] = UnknownMethodName;

    export class InvalidMethodArguments extends ConstellationError {
        constructor(message: string) {
            super(4004, message);
            InvalidMethodArguments.setProto(this);
        }
    }
    errors[4004] = InvalidMethodArguments;

    export class SessionExpired extends ConstellationError {
        constructor(message: string) {
            super(4005, message);
            SessionExpired.setProto(this);
        }
    }
    errors[4005] = SessionExpired;

    export class LiveUnknownEvent extends ConstellationError {
        constructor(message: string) {
            super(4106, message);
            ConstellationError.setProto(this);
        }
    }
    errors[4106] = LiveUnknownEvent;

    export class LiveAccessDenied extends ConstellationError {
        constructor(message: string) {
            super(4107, message);
            LiveAccessDenied.setProto(this);
        }
    }
    errors[4107] = LiveAccessDenied;

    export class LiveAlreadySubscribed extends ConstellationError {
        constructor(message: string) {
            super(4108, message);
            LiveAlreadySubscribed.setProto(this);
        }
    }
    errors[4108] = LiveAlreadySubscribed;

    export class LiveNotSubscribed extends ConstellationError {
        constructor(message: string) {
            super(4109, message);
            LiveNotSubscribed.setProto(this);
        }
    }
    errors[4109] = LiveNotSubscribed;
}
