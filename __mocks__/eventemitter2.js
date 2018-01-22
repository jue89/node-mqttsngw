const EventEmitter2 = jest.fn();
EventEmitter2.prototype.eventNames = jest.fn(() => [
	'sn.unicast.ingress',
	'sn.unicast.outgress',
	'sn.broadcast.ingress',
	'sn.broadcast.outgress',
	'broker.connect',
	'broker.connect.ack'
]);
EventEmitter2.prototype.onAny = jest.fn();
module.exports = { EventEmitter2 };
