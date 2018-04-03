# MQTT-SN Gateway

[MQTT For Sensor Networks (MQTT-SN)](http://mqtt.org/new/wp-content/uploads/2009/06/MQTT-SN_spec_v1.2.pdf) is a technology that enables sensors to join MQTT networks without the need for a TCP stack on the sensor. *mqttsngw* is a modularly designed software, that acts as a transparent gateway connecting the MQTT-SN world with the MQTT world.

Currently, the following components are available:
 - [mqttsngw-dtls](https://github.com/jue89/node-mqttsngw-dtls): Listens for incoming DTLS connections from sensors and parses MQTT-SN packets. Parsed MQTT-SN packets are put on the event bus.
 - [mqttsngw-core](https://github.com/jue89/node-mqttsngw-core): Handles parsed MQTT-SN packets from the event bus and maintains a state machine for each connected sensor. If necessary it requests a connection to the broker on the event bus.
 - [mqttsngw-mqttbroker](https://github.com/jue89/node-mqttsngw-mqttbroker): Maintains MQTT connections to a remote broker upon request from the event bus.

## Example

```js
const fs = require('fs');
const MQTTSNGW = require('mqttsngw');
const Core = require('mqttsngw-core');
const DTLS = require('mqttsngw-dtls');
const Broker = require('mqttsngw-mqttbroker');

// Logging methods to be injected in every module
const log = {
  debug: console.log,
  info: console.log,
  warn: console.log,
  error: console.error
};

MQTTSNGW({
  log: log                             // Will debug log all events on the event bus
}).attach(DTLS({
  log: log,                            // Log all events from the DTLS module
  bind: 12345,
  key: fs.readFileSync('gw.key.pem'),  // GW's private key
  cert: fs.readFileSync('gw.crt.pem'), // GW's certificate
  ca: fs.readFileSync('gw.ca.pem')     // CA certificate for checking sensor certificates
})).attach(Core({
  log: log                             // Log all events from the Core module
})).attach(Broker({
  log: log,                            // Log all events from the MQTT broker module
  broker: (clientId) => {              // Factory for every MQTT connection
    return {
      url: 'mqtts://example.org:8883',
      key: fs.readFileSync(`${clientId}.key.pem`),
      cert: fs.readFileSync(`${clientId}.crt.pem`)
    };
  }
})).start();                           // Starts every module
```
