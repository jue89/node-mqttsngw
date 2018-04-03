const EventEmitter = require('eventemitter2').EventEmitter2;

function MQTTSNGW (opts) {
	if (opts === undefined) opts = {};
	this.bus = new EventEmitter({
		wildcard: true
	});
	this.startMethods = [];
	// Proxy all events if the user want's debug log
	// This is necessary to be able to listen to all events without
	// being a listener from the event librarie's POV.
	// So, unconsumed (but logged) events can still be detected.
	if (opts.log && opts.log.debug) {
		this._bus = this.bus;
		this.bus = {
			on: (event, handler) => this._bus.on(event, handler),
			removeListener: (event, handler) => this._bus.removeListener(event, handler),
			emit: (event, arg) => {
				const eventStr = event instanceof Array ? event.join(',') : event;
				opts.log.debug(`Event: ${eventStr}`, Object.assign({
					message_id: '857746b8f8264d0fac0bfb8902eaff34',
					event: eventStr
				}, arg));
				return this._bus.emit(event, arg);
			}
		};
	}
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
