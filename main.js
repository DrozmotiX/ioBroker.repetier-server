'use strict';

/*
 * Created with @iobroker/create-adapter v2.3.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');
const WebSocket = require('ws'); // Lib to handle Websocket
let ws;
const stateDef = require('./lib/stateDef.js'); // Load attribute library
const warnMessages = {}; // Array containing warn messages to avoid duplicates
const wsConnection = {
	connectionActive : false,
	connectionNeeded : true
}; // Array containing websocket connection data
const printers = [];
const repServerConfig = {};

// Load your modules here, e.g.:
// const fs = require("fs");

class RepetierServer extends utils.Adapter {
	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	constructor(options) {
		super({
			...options,
			name: 'repetier-server',
		});
		this.on('ready', this.onReady.bind(this));
		this.on('stateChange', this.onStateChange.bind(this));
		this.on('message', this.onMessage.bind(this));
		this.on('unload', this.onUnload.bind(this));

		this.createdStatesDetails = {}; // Array of created states to avoid object overwrites
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	async onReady() {

		// Reset the connection indicator during startup
		this.setState('info.connection', false, true);

		// Read configuration from config
		repServerConfig.ip = this.config.ip;
		repServerConfig.apiKey = this.decrypt(this.config.token);
		repServerConfig.port = this.config.port;

		//ToDo: Consider to have this as option for advance mode only
		// Create State on root level to send custom messages
		await this.localeStateSetCreate('sendMessage', 'Send Custom Message', '');

		// Start connection handler to created & monitor websocket connection
		await this.connectionHandler();
		this.setState('info.connection', true, true);
	}

	/**
	 * `Connect websocket, keep connection alive and update values not included in regular websocket feed`
	 */
	async connectionHandler(){
		// Reset timer (if running)
		if (wsConnection && wsConnection.reconnectTimer ) clearTimeout(wsConnection.reconnectTimer );

		// Start websocket connection if required but not active
		if (wsConnection.connectionNeeded && !wsConnection.connectionActive) {
			// Consider writing message only 1 time if connection fails at first attempt
			this.log.info('Trying to connect to websocket');
			await this.webSocketHandler();
		} else if (wsConnection.connectionNeeded && wsConnection.connectionActive){ // If connection is active, request value updates for defined functions

			// Prepare ping message to keep websocket connection alive
			this.log.debug(`Send ping to server`);
			const messageArray = {
				'action': 'ping',
				'data': {},
				'callback_id': 800
			};

			// Send message to websocket connection
			ws.send(JSON.stringify(messageArray));

			// Request state updates for values not updated by live websocket feed (like time left & % of print)
			this.requestData('getPrinterInfo');

		}

		// Run connection handler every 5 seconds
		wsConnection.reconnectTimer = setTimeout(() => {
			this.connectionHandler();
		}, (5000));

	}

	/**
	 * `Connect to websocket & listen to events
	 */
	async webSocketHandler(){

		try {

			// Open websocket connection
			ws = new WebSocket(`ws://${repServerConfig.ip}:${repServerConfig.port}/socket`);

			// Event if connection is opened
			ws.on('open', () => {
				wsConnection.connectionActive = true;
				this.log.info(`Connected with Repetier Server`);
				// Request Printer details
				this.requestData(`getPrinterInfo`);
			});

			// Event if connection is closed, show warning if noe expected
			ws.on('close', () => {
				// Confirm inactive connection to memory
				wsConnection.connectionActive = false;
				// Avoid log message if connection is closed at adapter stop
				if (wsConnection.connectionNeeded === true)	this.log.warn(`Connection with Repetier Server closed, will try to reconnect`);
			});

			// Handle errors on socket connection
			ws.on('error', (error) => {
				this.log.error(error);
			});

			// Handle messages received from socket connection
			ws.on('message', async (data) => {
				// Confirm active connection to memory
				wsConnection.connectionActive = true;
				const messageObject = JSON.parse(data.toString());
				console.log(`[Callback ID] ${messageObject.callback_id}`);

				// Message id possibilities
				// -1 : Regular message by Repetier Server
				// 545 : Response to custom command
				// 800 : Response to "Keep alive ping"
				// 900 : List all printers and values
				if (messageObject.callback_id != '-1') {
					if (messageObject.callback_id == null){
						console.error(`undefined found`);
					}
					this.log.debug(`${JSON.stringify(messageObject)}`);
					if (messageObject.callback_id == '900') {
						await this.updatePrinterValues(messageObject);
					}
				} else {
					//ToDo: Seperate between unknown messages and event type = temperature
					this.log.debug(`${JSON.stringify(messageObject)}`);
					await this.updateTemperatures(messageObject);
				}
			});

		} catch (e) {
			this.log.error(`[ webSocketHandler ] ${e}`);
		}

	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 * @param {() => void} callback
	 */
	onUnload(callback) {

		try {

			// End timer if running
			if (wsConnection && wsConnection.reconnectTimer ) {
				clearTimeout(wsConnection.reconnectTimer );
			}

			// Close web socket if connected
			if (wsConnection.connectionNeeded || wsConnection.connectionActive){
				wsConnection.connectionNeeded = false;
				wsConnection.connectionActive = false;
				ws.close();
				this.log.info(`Connection to Repetier Server closed`);
			}

			callback();
		} catch (e) {
			callback();
		}
	}

	/**
	 * Is called if a subscribed state changes
	 * @param {string} id
	 * @param {ioBroker.State | null | undefined} state
	 */
	onStateChange(id, state) {
		if (state) {
			if (state.ack) return; // Ignore state change if value is acknowledged
			// The state was changed
			this.log.debug(`state ${id} changed: ${state.val} (ack = ${state.ack})`);

			// Store state root in workable format
			const printer = id.split('.');

			// Send gcode Command to specific printer
			if (id === `${this.namespace}.${printer[2]}.commands.send-gCode-Command` && state.val){

				// Prepare message to send g-code command
				const commandData = {
					'action': 'send',
					'data': {
						'cmd': state.val
					},
					'printer': printer[2],
					'callback_id': 545
				};
				// Send message to websocket
				ws.send(JSON.stringify(commandData));

				// Handle custom message, see https://www.repetier-server.com/manuals/programming/API/index.html
			} else if (id === `${this.namespace}.sendMessage`){
				ws.send(JSON.stringify(state.val));
			}
		} else {
			// The state was deleted
			this.log.debug(`state ${id} deleted`);
		}
	}

	/**
	 * Request data from Repetier Server
	 */
	requestData(requestType){

		switch (requestType) {
			case ('getPrinterInfo'):
				ws.send('{"callback_id":900,"data":{},"action":"listPrinter"}');
				break;

			default:
				console.error(`[ requestData ] Unknown request type ${requestType}`);
		}

	}

	/**
	 * Handle state updates received from websocket
	 * {boolean} ini If function call needs to initialize device
	 */
	async updatePrinterValues(data){
		// console.log(JSON.stringify(data));
		const dataObject = data.data;

		for (const printer in dataObject){
			if (printers[printer] == null) printers.push(dataObject[printer].slug);

			// Create folder root structure
			await this.customStates(dataObject[printer].slug);
			await this.localExtendObject(dataObject[printer].slug, 'device', printer);
			await this.localExtendObject(`${dataObject[printer].slug}.commands`, 'channel', `Printer commands`);

			// Create state for custom g-code command
			await this.localeStateSetCreate(`${dataObject[printer].slug}.commands.send-gCode-Command`, 'send gCode Command (M256 B0)', '');

			// Create state for each value
			for (const printerState in dataObject[printer]){
				let stateValue = dataObject[printer][printerState];

				// Recalculate epoch time to Human Readable format for time values
				if (printerState === 'start' || printerState === 'printTime'|| printerState === 'printStart' || printerState === 'printedTimeComp') stateValue = this.reCalcSeconds(stateValue);

				await this.localeStateSetCreate(`${dataObject[printer].slug}.${printerState}`, printerState, stateValue);
			}

			// Calculate remaining print time
			const calculatedTimeRemaining = this.reCalcSeconds(dataObject[printer].printTime - dataObject[printer].printedTimeComp);
			await this.localeStateSetCreate(`${dataObject[printer].slug}.printTimeRemaining`, 'Remaining Print time', calculatedTimeRemaining);

		}
		console.log(printers);
	}

	async updateTemperatures(data){

		// Handle all data content
		for (const device in data.data){

			if (data.data[device].event === `temp`){ // Verify if message contains updates for temperatures

				// Create root structure
				await this.localExtendObject(`${data.data[device].printer}.temperatures`, 'channel', data.data[device].printer);

				for (const tempStates in data.data[device].data){

					let channelNR = data.data[device].data.id;
					let temptype = 'Extruder';
					// Recalculate bed sensor number starting from 1
					if (channelNR >= 1000) {
						channelNR = 1000 - data.data[device].data.id;
						temptype = 'Bed';
					}

					await this.localExtendObject(`${data.data[device].printer}.temperatures.${temptype}`, 'channel', `${temptype} Temperatures`);
					await this.localExtendObject(`${data.data[device].printer}.temperatures.${temptype}.${channelNR}`, 'channel', `Sensor ${channelNR}`);
					await this.localeStateSetCreate(`${data.data[device].printer}.temperatures.${temptype}.${channelNR}.${tempStates}`, tempStates, data.data[device].data[tempStates]);
				}

			}
		}
	}

	reCalcSeconds(allSeconds){
		let totalSeconds = Math.round(allSeconds);
		const hours = ('00' + Math.floor(totalSeconds / 3600)).slice(-2);
		totalSeconds %= 3600;
		const minutes = ('00' + Math.floor(totalSeconds / 60)).slice(-2);
		const seconds = ('00' + totalSeconds % 60).slice(-2);
		return (hours + ':' + minutes + ':' + seconds);
	}

	// Handle messages from adapter settings showing available current printers tp passing custom states
	async onMessage(obj) {

		if (obj) {
			switch (obj.command) {
				case 'getPrinterList':
					if (obj.callback) {

						// Return array of all printer including option all
						const printerSelect = ['all'];
						for (const printer in printers) {
							printerSelect.push(printers[printer]);
						}
						this.sendTo(obj.from, obj.command, printerSelect, obj.callback);
					}
					break;

			}
		}
	}

	/**
	 * Generic function to create objects
	 * @param {string} id
	 * @param {'channel' | 'device'} type
	 * @param {string} name
	 */
	async localExtendObject(id, type, name) {

		try {
			const objectDefinition = {
				type: type,
				common: {
					name: name
				}
			};

			if (!this.createdStatesDetails[id]){
				await this.extendObjectAsync(id, objectDefinition);
				this.createdStatesDetails[id] = objectDefinition;
			}
		} catch (e) {
			this.log.error(`[ localExtendObject ] ${e}`);
		}
	}

	/**
	 * State create and value update handler
	/**
	 * Generic function to create states & write value updates
	 * @param {string} stateName ID of state to create
	 * @param {string} name Name of object
	 * @param {object} value Value
	 */
	async localeStateSetCreate(stateName, name, value) {
		this.log.debug('Create_state called for : ' + stateName + ' with value : ' + value);

		try {

			// Try to get details from state lib, if not use defaults. throw warning is states is not known in attribute list
			const common = {};
			if (!stateDef[name]) {
				const warnMessage = `State attribute definition missing for : ${name}`;
				if (warnMessages[stateName] !== warnMessage) {
					warnMessages[stateName] = warnMessage;
					console.info(`No specific state attributes assigned for : ${name} with value : ${value}`);
				}
			}

			if (stateDef[name] != null && stateDef[name].min != null){
				common.min = stateDef[name].min;
			}
			if (stateDef[name] != null && stateDef[name].max != null){
				common.max = stateDef[name].max;
			}

			common.name = stateDef[name] != null ? stateDef[name].name || name : name;
			common.type = stateDef[name] != null ? stateDef[name].type || typeof (value) : typeof (value) ;
			common.role = stateDef[name] != null ? stateDef[name].role || 'state' : 'state';
			common.read = true;
			common.unit = stateDef[name] != null ? stateDef[name].unit || '' : '';
			common.write = stateDef[name] != null ? stateDef[name].write || false : false;

			if ((!this.createdStatesDetails[stateName])
				|| (this.createdStatesDetails[stateName]
					&& (
						common.name !== this.createdStatesDetails[stateName].name
						|| common.name !== this.createdStatesDetails[stateName].name
						|| common.type !== this.createdStatesDetails[stateName].type
						|| common.role !== this.createdStatesDetails[stateName].role
						|| common.read !== this.createdStatesDetails[stateName].read
						|| common.unit !== this.createdStatesDetails[stateName].unit
						|| common.write !== this.createdStatesDetails[stateName].write
					)
				)) {

				this.log.debug(`An attribute has changed : ${stateName} | old ${this.createdStatesDetails[stateName]} | new ${JSON.stringify(common)}`);

				await this.extendObjectAsync(stateName, {
					type: 'state',
					common
				});

				// Store current object definition to memory
				this.createdStatesDetails[stateName] = common;

				// Subscribe on state changes if writable
				common.write && this.subscribeStates(stateName);

			} else {
				// console.log(`Nothing changed do not update object`);
			}

			// Set value to state
			if (value != null) {
				await this.setStateChangedAsync(stateName, {
					val: typeof value === 'object' ? JSON.stringify(value) : value, // real objects are not allowed
					ack: true,
				});
			}

		} catch (error) {
			// this.errorHandler(`[create_state]`, error);
			this.log.error(`[create_state] ${error}`);
		}
	}

}

if (require.main !== module) {
	// Export the constructor in compact mode
	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	module.exports = (options) => new RepetierServer(options);
} else {
	// otherwise start the instance directly
	new RepetierServer();
}
