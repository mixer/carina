const EventEmitter = require('events').EventEmitter;
const Carina = require('..');
const Subscription = Carina.Subscription;
const State = Carina.SocketState;

describe('subscription class', () => {
    let socket;
    let subscription;

    beforeEach(() => {
        socket = new EventEmitter();
        socket.execute = sinon.stub();
        setState(State.Idle);
        subscription = new Subscription(socket, 'user:1:update');
    });

    const setState = state => {
        socket.emit('state', state);
        socket.getState = () => state;
    };

    it('attaches listeners initially', () => {
        subscription.add(sinon.stub());
        expect(socket.execute).to.not.have.been.called;

        setState(State.Connected);
        expect(socket.execute).to.have.been
        .calledWith('livesubscribe', { events: ['user:1:update'] });
    });

    it('attaches listeners if the socket is already connected', () => {
        setState(State.Connected);
        subscription.add(sinon.stub());
        expect(socket.execute).to.have.been
        .calledWith('livesubscribe', { events: ['user:1:update'] });
    });

    it('dispatches events correctly', () => {
        const trigger = sinon.stub();
        setState(State.Connected);
        subscription.add(trigger);

        socket.emit('event:live', { channel: 'user:2:update', payload: 'bar' });
        expect(trigger).not.to.have.been.called;

        socket.emit('event:live', { channel: 'user:1:update', payload: 'foo' });
        expect(trigger).to.have.been.calledWith('foo');
    });

    describe('unsubscription', () => {
        let trigger;

        beforeEach(() => {
            setState(State.Connected);
            trigger = sinon.stub();
            subscription.add(trigger);
        });

        it('unsubscribes successfully', () => {
            subscription.remove(trigger);
            expect(socket.execute).to.have.been
            .calledWith('liveunsubscribe', { events: ['user:1:update'] });
        });

        it('does not unsubscribe with other listeners still there', () => {
            subscription.add(sinon.stub);
            subscription.remove(trigger);
            expect(socket.execute).not.to.have.been.calledWith('liveunsubscribe');
        });

        it('clears all', () => {
            subscription.removeAll();
            expect(socket.execute).to.have.been.calledWith('liveunsubscribe');
        });

        it('does not resubscribe on reconnect without any listeners', () => {
            subscription.remove(trigger);
            expect(socket.execute).to.have.been.calledWith('liveunsubscribe');
            socket.execute = sinon.stub(); // clear calls for convenience
            setState(State.Connected);
            expect(socket.execute).to.not.have.been.called;
        });
    });
});
