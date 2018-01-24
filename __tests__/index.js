jest.mock('eventemitter2');

const eventemitter2 = require('eventemitter2');
const mqttsngw = require('../index.js');

test('attach module and call its factory', (done) => {
	const m = mqttsngw();
	m.attach((bus) => {
		try {
			expect(bus).toBe(m.bus);
			done();
		} catch (e) { done(e); }
	});
});

test('make attach commands cascadable', () => {
	const m1 = mqttsngw();
	const m2 = m1.attach(() => {});
	expect(m2).toBe(m1);
});

test('call all start functions', () => {
	return mqttsngw().attach((bus) => () => Promise.resolve()).start();
});

test('resolve instance on successful start', () => {
	const m1 = mqttsngw();
	return m1.start().then((m2) => {
		expect(m2).toBe(m1);
	});
});

test('call shutdown handler', () => {
	return mqttsngw()
		.attach((setup) => (start) => (stop) => Promise.reject(new Error('stop')))
		.start()
		.then((m) => m.shutdown())
		.then(() => Promise.reject(new Error('FAILED')))
		.catch((e) => {
			expect(e.message).toEqual('stop');
		});
});

test('register debug handler', (done) => {
	const debug = (eventName, arg) => {
		try {
			expect(eventName).toEqual('name');
			expect(arg).toEqual('arg');
			done();
		} catch (e) { done(e); }
	};
	mqttsngw({ log: { debug } });
	eventemitter2.EventEmitter2.prototype.onAny.mock.calls[0][0]('name', 'arg');
});
