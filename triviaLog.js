/*eslint-env es6*/
// Minimum dependency (or even zero) logger facility.
// TODO:
// define external destination (file, network) DONE (file)
// create (optionally) a web server who send last "n" log entries

'use strict';
var trivialog = {};

const util = require('util');
const fs   = require('fs');

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


// Parameters for logging. Default to INFO
var logParams = new Map();

logParams.set('limit', 'INFO');
logParams.set('outFile', null);
logParams.set('outNet', null);



/**
 * Return a beautifully formatted date
 * 
 * @returns {String} - 
 */
function formatDate() {
	let d = new Date();
	return d.getFullYear() + '-' + ('0' + (d.getMonth()+1)).slice(-2) + '-'
		+ ('0' + d.getDate()).slice(-2) + ' ' + ('0' + d.getHours()).slice(-2) + ':'
		+ ('0' + d.getMinutes()).slice(-2) + ':' + ('0' + d.getSeconds()).slice(-2) + '.'
		+ d.getMilliseconds();
}


/**
 * Main function, write logs
 */
trivialog.log = function() {
	let logLevel = 'INFO';
	let msg = '';
	let msgObj = '';
	let msgObjFile = '';

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
		let d = formatDate();
		// Log to console (always)
		console.log(d + ' ['+logLevel+']' + msg + msgObj);
		// Then try if defined an output to file
		if ( typeof logParams.get('outFile') === 'string' )
			fs.appendFile(logParams.get('outFile'), d + ' ['+logLevel+']' + msg + msgObjFile +'\n', (err) => {
				if (err) throw err;
			});
	}
}

/**
 * Set logParams (with parameter name)
 * 
 * @param {String} param - to be modified
 * @param {String} value - to be set
 */
trivialog.setParam = function(param, value) {

	const err = 'Something wrong with .setParam: ' + param;

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
		default:
			logParams.set(param, value);
	}

}

/**
 * Show Parameter value
 * 
 * @param {String} param - to get
 * @returns
 */
trivialog.getParam = function(param) {
	if (typeof param === 'string' && logParams.has(param))
		return logParams.get(param);
}

module['exports'] = trivialog;
