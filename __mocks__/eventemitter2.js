const EventEmitter2 = jest.fn();
EventEmitter2.prototype.onAny = jest.fn();
module.exports = { EventEmitter2 };
