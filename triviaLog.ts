/// <reference path="typings/index.d.ts" />

// Minimum dependency (or even zero) logger facility.
// Could write log to console, log o network (UDP)

'use strict';
const util  = require('util');
const fs    = require('fs');
const dgram = require('dgram');
const os    = require('os'); // For hostname
const udpClient = dgram.createSocket('udp4');

// Default display option for Terminal output
const mesgDisplayOptions = {
	showHidden: false,
	depth: null,
	colors: true
}

// Default inspect option for File/Newtork output
const mesgFileOptions = {
	showHidden: false,
	depth: null,
	colors: false
}


// Define a Map (ES6) with all values available for log levels
const logLevels = new Map();

logLevels.set('EMER',    0);
logLevels.set('ALERT',   1);
logLevels.set('CRIT',    2);
logLevels.set('ERR',     3);
logLevels.set('WARN',    4);
logLevels.set('NOTICE',  5);
logLevels.set('INFO',    6);
logLevels.set('DEBUG',   7);


// Parameters for logging. Set Defaults
var logParams = new Map();

logParams.set('limit', 'INFO');
logParams.set('outFile', null);
logParams.set('outScreen', true);
logParams.set('outNet', null);
logParams.set('outPort', 4321);
logParams.set('hostname', os.hostname());

/**
 * Return a beautifully formatted date
 * 
 * @returns {String} - 
 */
function formatDate():string {
	let d = new Date();
	return d.getFullYear() + '-' + ('0' + (d.getMonth()+1)).slice(-2) + '-'
		+ ('0' + d.getDate()).slice(-2) + ' ' + ('0' + d.getHours()).slice(-2) + ':'
		+ ('0' + d.getMinutes()).slice(-2) + ':' + ('0' + d.getSeconds()).slice(-2) + '.'
		+ d.getMilliseconds();
}


/**
 * Main function, write logs
 */
function log() {
	let logLevel: string = 'INFO';
	let msg: string = '';
	let msgObj: string = '';
	let msgObjFile: string = '';

	for ( let pos = 0; pos < arguments.length; pos++ ) {
		// Check if first argument is a level-reserved word (see logLevels Map above).
		if ( pos === 0 && logLevels.has(arguments[0]) )
			logLevel = arguments[0];
		else {
			if ( typeof arguments[pos] === 'string' )
				msg = msg + ' ' + arguments[pos];
			if ( typeof arguments[pos] === 'object' ) {
				msgObj = msgObj + ' - ' + util.inspect(arguments[pos], mesgDisplayOptions);
				msgObjFile = msgObjFile + ' - ' + util.inspect(arguments[pos], mesgFileOptions);
			}
		}
	}

	// Output only if logLevel is equal or less than the actual limit (logParams)
	if (logLevels.get(logLevel) <= logLevels.get(logParams.get('limit')) ) {
		let d: string = formatDate();
		// Log to console if enabled
		if ( logParams.get('outScreen'))
			console.log(d + ' ['+logLevel+']' + msg + msgObj);
		// Then try if defined an output to file
		if ( typeof logParams.get('outFile') === 'string' )
			fs.appendFile(logParams.get('outFile'), d + ' ['+logLevel+']' + msg + msgObjFile +'\n', (err) => {
				if (err) throw err;
			});
		if ( typeof logParams.get('outNet') === 'string' ) {
			const portNumber =  logParams.get('port');
			const server =  logParams.get('outNet');
			let message = new Buffer(logParams.get('hostname') + '|' + d + ' ['+logLevel+']' + msg + msgObj + '\n');
			udpClient.send(message, 0, message.length, logParams.get('outPort'), logParams.get('outNet'), (err) => {
				if (err) throw err;
			});
		}
	}
}

/**
 * Set logParams (with parameter name)
 * 
 * @param {String} param - to be modified
 * @value {Any} value - to be set
 */
function setParam(param: string, value: any) {

	let err = 'Something wrong with .setParam: You can\'t set "' + param + '"';

	// If param name is invalid (not string or non exists)
	if (typeof param !== 'string' || !logParams.has(param)) throw err;
	switch (param) {
		case 'limit':
			if (logLevels.has(value))
				logParams.set(param,value);
		break;
		case 'outFile':
			// Write a message to file, if Ok, set parameter and use it for outputs
			// Use sync version (only here) because I need to wait for disk before set logParams
			fs.appendFileSync(value, formatDate() + ' Starting...\n', 'utf8');
			logParams.set(param,value);
		break;
		case 'outNet':
			err = 'This value for "server" is invalid: ${value}';
			if (typeof value !== 'string') throw err;
			// Set server IP/hostname where send logs
			logParams.set(param,value);
		break;
		case 'outPort':
			// Set port number of remote Server
			err = 'This value for "port" is invalid: ${value}';
			if (isNaN(value))
				throw err;
			
			if (value < 1 || value > 65535)
				throw err;
			logParams.set(param,value);
		break;
		default:
			// TODO: Is it better to Set anyway the value or throw an error?
			logParams.set(param, value);
	}

}

/**
 * Show Parameter value
 * 
 * @param {String} param - to get
 * @returns
 */
function getParam(param: string) {
	if (typeof param === 'string' && logParams.has(param))
		return logParams.get(param);
}

const trivialog = {
	log: log,
	getParam: getParam,
	setParam: setParam
}

module['exports'] = trivialog;
