const EventEmitter = require('eventemitter2').EventEmitter2;

function MQTTSNGW (opts) {
	if (opts === undefined) opts = {};
	this.bus = new EventEmitter();
	this.startMethods = [];
	if (opts.debug) this.bus.onAny(opts.debug);
}

MQTTSNGW.prototype.attach = function (factory) {
	this.startMethods.push(factory(this.bus));
	return this;
};

MQTTSNGW.prototype.start = function () {
	const names = this.bus.eventNames();
	const missingName = [
		'sn.unicast.ingress',
		'sn.unicast.outgress',
		'sn.broadcast.ingress',
		'sn.broadcast.outgress',
		'broker.connect',
		'broker.connect.ack'
	].find((name) => names.indexOf(name) === -1);
	if (missingName !== undefined) {
		return Promise.reject(new Error(`No listener for ${missingName}`));
	}

	return Promise.all(this.startMethods.map((start) => start())).then((stopHandler) => {
		this.stopHandler = stopHandler;
		return this;
	});
};

MQTTSNGW.prototype.shutdown = function () {
	return Promise.all(this.stopHandler.map((handler) => handler()));
};

module.exports = (opts) => new MQTTSNGW(opts);
