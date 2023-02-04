// Classification of all state attributes possible
const stateDef = {
	'sendMessage': {
		write: true,
	},
	'send gCode Command (M256 B0)': {
		write: true,
	},
	'start': {
		type: 'string',
	},
	'printTime': {
		type: 'string',
	},
	'printStart': {
		type: 'string',
	},
	'printedTimeComp': {
		type: 'string',
	},
	'string': {
		type: 'string',
	}
};

module.exports = stateDef;