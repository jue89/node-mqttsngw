const EventEmitter = require('eventemitter2').EventEmitter2;

function MQTTSNGW (opts) {
	if (opts === undefined) opts = {};
	this.bus = new EventEmitter();
	this.startMethods = [];
}

MQTTSNGW.prototype.attach = function (factory) {
	this.startMethods.push(factory(this.bus));
	return this;
};

MQTTSNGW.prototype.start = function () {
	return Promise.all(this.startMethods.map((start) => start())).then((stopHandler) => {
		this.stopHandler = stopHandler;
		return this;
	});
};

MQTTSNGW.prototype.shutdown = function () {
	return Promise.all(this.stopHandler.map((handler) => handler()));
};

module.exports = (opts) => new MQTTSNGW(opts);
