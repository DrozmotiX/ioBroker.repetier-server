'use strict';

/*
 * Created with @iobroker/create-adapter v2.3.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');
const WebSocket = require('ws'); // Lib to handle Websocket
let ws;
const wsConnection = {
	connectionActive : false,
	connectionNeeded : true
};
const printers = []

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
		await this.extendObjectAsync(`sendMessage`, {
			type: 'state',
			common : {
				name: 'sendMessage',
				type: 'string',
				role: 'value',
				write: true,
			}
		});

		//ToDo: Consider to have this as option for advance mode only
		// Create and listen to state to send messags
		this.subscribeStates(`sendMessage`);
		// Start connection handler
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
			ws = new WebSocket(`ws://192.168.130.235:3344/socket`);

			// Handle messages received from socket connection
			ws.on('message', async (data) => {
				wsConnection.connectionActive = true;
				const messageObject = JSON.parse(data.toString());
				console.log(`[Callback ID] ${messageObject.callback_id}`);
				if (messageObject.callback_id != '-1') {
					if (messageObject.callback_id == null){
						console.error(`undefined found`);
					}
					this.log.debug(`${JSON.stringify(messageObject)}`);
					if (messageObject.callback_id == '900') {
						await this.updatePrinterValues(messageObject);
					}
				} else {
					this.log.debug(`${JSON.stringify(messageObject)}`);
					this.updateTemperatures(messageObject);
				}
			});

			// Event if connection is closed, show warning if noe expected
			ws.on('close', () => {
				wsConnection.connectionActive = false;
				if (wsConnection.connectionNeeded === true)	this.log.warn(`Connection with Repetier Server closed, will try to reconnect`);
			});

			// Event if connection is opened
			ws.on('open', () => {
				wsConnection.connectionActive = true;
				this.log.info(`Connected with Repetier Server`);
				// Request Printer details
				this.requestData(`getPrinterInfo`);
			});

			// Handle errors on socket connection
			ws.on('error', (error) => {
				this.log.error(error);
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
				wsConnection.connectionActive;
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

				const commandData = {
					'action': 'send',
					'data': {
						'cmd': state.val
					},
					'printer': printer[2],
					'callback_id': 545
				};
				ws.send(JSON.stringify(commandData));

				// Handle message object see https://www.repetier-server.com/manuals/programming/API/index.html
			} else if (id === `${this.namespace}.sendMessage`){
				ws.send(JSON.stringify(state.val));
			}
		} else {
			// The state was deleted
			this.log.debug(`state ${id} deleted`);
		}
	}

	/**
	 * Request data from websocket
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
	 * Handle state updates receive from websocket
	 */
	async updatePrinterValues(data){
		// console.log(JSON.stringify(data));
		const dataObject = data.data;

		for (const printer in dataObject){
			if (printers[printer] == null) printers.push(dataObject[printer].slug);

			await this.localExtendObject(dataObject[printer].slug, 'device', printer);

			await this.localExtendObject(`${dataObject[printer].slug}.commands`, 'channel', `Printer commands`);

			await this.extendObjectAsync(`${dataObject[printer].slug}.commands.send-gCode-Command`, {
				type: 'state',
				common : {
					name: 'send gCode Command (M256 B0)',
					type: 'string',
					role: 'value',
					write: true,
				}
			});

			this.subscribeStates(`${dataObject[printer].slug}.commands.send-gCode-Command`);

			// }

			for (const printerState in dataObject[printer]){
				// console.log(dataObject[printer][printerState]);
				let stateType = typeof dataObject[printer][printerState];
				if (printerState === 'start' || printerState === 'printTime'|| printerState === 'printStart' || printerState === 'printedTimeComp') stateType = 'string';
				await this.extendObjectAsync(`${dataObject[printer].slug}.${printerState}`, {
					type: 'state',
					common : {
						name: printerState,
						type: stateType,
						role: 'value',
						write: false
					}
				});
				let stateValue = dataObject[printer][printerState];
				if (printerState === 'start' || printerState === 'printTime'|| printerState === 'printStart' || printerState === 'printedTimeComp') stateValue = this.reCalcSeconds(stateValue);
				this.setState(`${dataObject[printer].slug}.${printerState}`, {val: stateValue, ack: true });
			}

			await this.extendObjectAsync(`${dataObject[printer].slug}.printTimeRemaining`, {
				type: 'state',
				common : {
					name: 'Remaining Print time',
					type: 'string',
					role: 'value',
					write: false
				}
			});

			const calculatedTimeRemaining = this.reCalcSeconds(dataObject[printer].printTime - dataObject[printer].printedTimeComp);
			this.setState(`${dataObject[printer].slug}.printTimeRemaining`, {val: calculatedTimeRemaining, ack: true });

		}
		console.log(printers);
	}

	async updateTemperatures(data){

		// Handle all data content
		for (const device in data.data){
			// console.log(data.data[device]);
			if (data.data[device].event === `temp`){ // Verify if message contains updates for temperatures

				await this.localExtendObject(`${data.data[device].printer}.temperatures`, 'channel', data.data[device].printer);

				for (const tempStates in data.data[device].data){

					await this.localExtendObject(`${data.data[device].printer}.temperatures.extruder`, 'channel', data.data[device].printer);

					if (data.data[device].data.id < 1000) {

						await this.localExtendObject(`${data.data[device].printer}.temperatures.extruder.${data.data[device].data.id}`, `Extruder channel ${data.data[device].data.id}`;

						await this.extendObjectAsync(`${data.data[device].printer}.temperatures.extruder.${data.data[device].data.id}.${tempStates}`, {
							type: 'state',
							common: {
								name: tempStates,
								type: typeof data.data[device].data[tempStates],
								role: 'value',
							}
						});
						this.setState(`${data.data[device].printer}.temperatures.extruder.${data.data[device].data.id}.${tempStates}`, {val: data.data[device].data[tempStates], ack: true });
					} else {

						// Use recognisable channel ID for bed

						const channelNR = 1000 - data.data[device].data.id;

						await this.localExtendObject(`${data.data[device].printer}.temperatures.bed.${channelNR}`, 'channel', `Extruder channel ${channelNR}`);


						await this.extendObjectAsync(`${data.data[device].printer}.temperatures.bed.${channelNR}.${tempStates}`, {

							type: 'state',
							common: {
								name: tempStates,
								type: typeof data.data[device].data[tempStates],
								role: 'value',
							}
						});
						this.setState(`${data.data[device].printer}.temperatures.bed.${channelNR}.${tempStates}`, {val: data.data[device].data[tempStates], ack: true });
					}

				}

			}
		}

		// Identity if received values are temperature related

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
	 * Create root objects
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
