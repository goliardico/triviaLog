## TriviaLog

Build on top of console.log, TriviaLog don't use any external dependencies trying to be the smallest as possible.

## Code Example

After installation, include the library and print some messages:

```javascript
tl = require('trivialog');

// Set log limit to WARN (don't print everthing above)
tl.setParam('limit', 'WARN');

tl.log('ALERT', 'This will be printed to console.');
tl.log('DEBUG', 'This will NOT be shown to console because DEBUG level is above ALERT.');

// Print also to a log file
tl.setParam('outFile', './test.log');

tl.log('ALERT', 'write to file', {f1: 100, f2: 'It is too late', f3: true});

```

## Motivation

I made this just to test and experiment with npm module creation, but it's works and I'll use it.

## Installation

TODO: I don't have already publish to npm...

Install as regular npm module:

```sh

npm install trivialog

```

## API Reference

Use .setParam to modify default parameter or set output file.

Use .getParam to read value of param.

List of available parameters:
* limit: set log limit (use next table reference)
* outFile: set an output file
* outNet: set a network destination, UDP (TODO)

### LogLevels
````javascript
logLevels.set('EMER',    0);
logLevels.set('ALERT',   1);
logLevels.set('CRIT'    ,2);
logLevels.set('ERR',     3);
logLevels.set('WARN',    4);
logLevels.set('NOTICE',  5);
logLevels.set('INFO',    6);
logLevels.set('DEBUG',   7);
````

## License

Released under MIT License (see LICENSE file).
