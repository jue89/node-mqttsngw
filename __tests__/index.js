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

test('debug log events', () => {
	const EVENT = 'test';
	const OBJ = { test2: 2 };
	const debug = jest.fn();
	mqttsngw({ log: { debug } })
		.attach((bus) => () => { bus.emit(EVENT, OBJ); })
		.start();
	expect(debug.mock.calls[0][0]).toEqual(`Event: ${EVENT}`);
	expect(debug.mock.calls[0][1]).toMatchObject(Object.assign({
		message_id: '857746b8f8264d0fac0bfb8902eaff34'
	}, OBJ));
});
