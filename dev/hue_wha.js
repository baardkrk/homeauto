/* 
Received Zigbee message from 'blob_light', type 'readResponse', cluster 'genBasic', data '{"zclVersion":2}' from endpoin>
Received message from unsupported device with Zigbee model '929003054101' and manufacturer name 'Philips'
*/

const fz = require('zigbee-herdsman-converters/converters/fromZigbee');
const tz = require('zigbee-herdsman-converters/converters/toZigbee');
const exposes = require('zigbee-herdsman-converters/lib/exposes');
const reporting = require('zigbee-herdsman-converters/lib/reporting');
const extend = require('zigbee-herdsman-converters/lib/extend');
const e = exposes.presets;
const ea = exposes.access;

const definition = {
    zigbeeModel: ['929003054101'],
    model: '9290024898',
    vendor: 'Philips',
    description: 'Philips Hue White Ambiance',
    // fromZigbee: [], // We will add this later
    // toZigbee: [], // Should be empty, unless device can be controlled (e.g. lights, switches).
    // exposes: [e.battery(), e.temperature(), e.humidity()], // Defines what this device exposes, used for e.g. Home Assistant discovery and in the frontend
    extend: extend.light_onoff_brightness_colortemp(),
};

module.exports = definition;
