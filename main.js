'use strict';

/*
 * Created with @iobroker/create-adapter v2.3.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');
const WebSocket = require('ws'); // Lib to handle Websocket
let allMessagesToLOG = false;
let ws;
const wsConnection = {
	connectionActive : false,
	connectionNeeded : true
};

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
		// this.on('objectChange', this.onObjectChange.bind(this));
		// this.on('message', this.onMessage.bind(this));
		this.on('unload', this.onUnload.bind(this));
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	async onReady() {
		// Initialize your adapter here

		// Reset the connection indicator during startup
		this.setState('info.connection', false, true);

		await this.extendObjectAsync('allMessageToLog', {
			type: 'state',
			common : {
				name: 'Define LogLevel for debugging',
				type: 'boolean',
				role: 'switch',
				def: false,
				write: true,
			}
		});


		this.subscribeStates('allMessageToLog');

		const resultLogMessage = await this.getStateAsync('allMessageToLog');
		if (resultLogMessage && resultLogMessage.val != null && typeof resultLogMessage.val == 'boolean') allMessagesToLOG = resultLogMessage.val;

		await this.watchDog();
		this.setState('info.connection', true, true);
	}

	async watchDog(){
		// Reset timer (if running) and start 10s delay to r un watchdog
		if (wsConnection && wsConnection.reconnectTimer ) {
			clearTimeout(wsConnection.reconnectTimer );
		}

		if (wsConnection.connectionNeeded && !wsConnection.connectionActive) {
			this.log.info('Trying to connect to websocket');
			await this.webSocketHandler();
		} else if (wsConnection.connectionNeeded && wsConnection.connectionActive){ // If connection is active, request value updates for defined functions
			this.requestData('getPrinterInfo');
			this.log.debug(`Send ping to server`);
			const messageArray = {
				'action': 'ping',
				'data': {},
				'callback_id': 800
			};
			ws.send(JSON.stringify(messageArray));
		}

		wsConnection.reconnectTimer = setTimeout(() => {
			this.watchDog();
		}, (5000));

	}

	async webSocketHandler(){

		try {
			ws = new WebSocket(`ws://192.168.130.235:3344/socket`);

			// Handle messages received from socket connection
			ws.on('message', async (data) => {
				wsConnection.connectionActive = true;
				const messageObject = JSON.parse(data.toString());
				console.log(messageObject.callback_id);
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

			// Handle closure of socket connection
			ws.on('close', () => {
				wsConnection.connectionActive = false;
				if (wsConnection.connectionNeeded === true)	this.log.warn(`Connection with Repetier Server closed, will try to reconnect`);

			});

			ws.on('open', () => {
				this.log.info(`Connected with Repetier Server`);
				wsConnection.connectionActive = true;
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
			// Here you must clear all timeouts or intervals that may still be active
			// clearTimeout(timeout1);
			// clearTimeout(timeout2);
			// ...
			// clearInterval(interval1);

			callback();
		} catch (e) {
			callback();
		}
	}

	// If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
	// You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
	// /**
	//  * Is called if a subscribed object changes
	//  * @param {string} id
	//  * @param {ioBroker.Object | null | undefined} obj
	//  */
	// onObjectChange(id, obj) {
	// 	if (obj) {
	// 		// The object was changed
	// 		this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
	// 	} else {
	// 		// The object was deleted
	// 		this.log.info(`object ${id} deleted`);
	// 	}
	// }

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
			const printer = id.split('.');
			if (id === `${this.namespace}.${printer[2]}.commands.send-gCode-Command` && state.val){

				const commandData = {
					'action': 'send',
					'data': {
						'cmd': state.val
					},
					'printer': 'Ender3_S1',
					'callback_id': 545
				};
				ws.send(JSON.stringify(commandData));
			} else if (id === `${this.namespace}.${printer[2]}.commands.sendMessage`){
				ws.send(JSON.stringify(state.val));
			} else if (id === `${this.namespace}.allMessageToLog` && typeof state.val == 'boolean' ) {
				allMessagesToLOG = state.val;
			}
		} else {
			// The state was deleted
			this.log.debug(`state ${id} deleted`);
		}
	}

	requestData(requestType){

		switch (requestType) {
			case ('getPrinterInfo'):
				ws.send('{"callback_id":900,"data":{},"action":"listPrinter"}');
				break;

			default:
				console.error(`[ requestData ] Unknown request type ${requestType}`);
		}

	}

	async updatePrinterValues(data){
		// console.log(JSON.stringify(data));
		const dataObject = data.data;
		console.log(data.event);
		for (const printer in dataObject){

			// if (!this.devices[deviceIP].initialized){
			await this.extendObjectAsync(dataObject[printer].slug, {
				type: 'device',
				common: {
					name: printer
				},
			});

			await this.extendObjectAsync(`${dataObject[printer].slug}.commands`, {
				type: 'channel',
				common: {
					name: `Printer commands`
				},
			});

			await this.extendObjectAsync(`${dataObject[printer].slug}.commands.sendMessage`, {
				type: 'state',
				common : {
					name: 'sendMessage',
					type: 'string',
					role: 'value',
					write: true,
				}
			});

			await this.extendObjectAsync(`${dataObject[printer].slug}.commands.send-gCode-Command`, {
				type: 'state',
				common : {
					name: 'send gCode Command (M256 B0)',
					type: 'string',
					role: 'value',
					write: true,
				}
			});

			this.subscribeStates(`${dataObject[printer].slug}.commands.sendMessage`);
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
	}

	async updateTemperatures(data){

		// Handle all data content
		for (const device in data.data){
			// console.log(data.data[device]);
			if (data.data[device].event === `temp`){ // Verify if message contains updates for temperatures
				await this.extendObjectAsync(`${data.data[device].printer}.temperatures`, {
					type: 'channel',
					common: {
						name: data.data[device].printer
					},
				});

				for (const tempStates in data.data[device].data){
					await this.extendObjectAsync(`${data.data[device].printer}.temperatures.extruder`, {
						type: 'channel',
						common: {
							name: data.data[device].printer
						},
					});

					if (data.data[device].data.id < 1000) {

						await this.extendObjectAsync(`${data.data[device].printer}.temperatures.extruder.${data.data[device].data.id}`, {
							type: 'channel',
							common: {
								name: `Extruder channel ${data.data[device].data.id}`
							},
						});

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

						await this.extendObjectAsync(`${data.data[device].printer}.temperatures.bed.${channelNR}`, {
							type: 'channel',
							common: {
								name: `Extruder channel ${channelNR}`
							},
						});

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

	// If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
	// /**
	//  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
	//  * Using this method requires "common.messagebox" property to be set to true in io-package.json
	//  * @param {ioBroker.Message} obj
	//  */
	// onMessage(obj) {
	// 	if (typeof obj === 'object' && obj.message) {
	// 		if (obj.command === 'send') {
	// 			// e.g. send email or pushover or whatever
	// 			this.log.info('send command');

	// 			// Send response in callback if required
	// 			if (obj.callback) this.sendTo(obj.from, obj.command, 'Message received', obj.callback);
	// 		}
	// 	}
	// }
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
