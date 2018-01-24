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
