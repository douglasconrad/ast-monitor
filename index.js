var utils = require('./lib/utils');
var EventEmitter = require('events').EventEmitter;
var obj = {};

// You need pass as argument:
// port: the Asterisk Manager port
// host: Asterisk Manager host address
// username: Asterisk Manager username
// password: Asterisk Manager password
// evts: an array with the events you want monitor, can be:
// - peers: can be an object { peers: [PEER_NAME1, PEER_NAME2]} or just the string 'peers' to monitor all peers
// - trunks: can be an object { trunks: [TRUNK_TECH/TRUNK_NAME1, TRUNK_TECH/TRUNK_NAME2]} or just the string 'trunks' to monitor all trunks
// Example1: [ 'peers', 'trunks' ]  -> this will monitor all peers and all trunks.
// Example2: [ {'peers':['8020', '8021' ], 'trunks' ]  -> this will monitor the peers 8020 and 8021,  and all trunks.
// Example2: [ {'peers':['8020', '8021' ], {'trunks':['SIP/opens']} ]  -> this will monitor the peers 8020 and 8021,  and the trunk 'SIP/opens'.
function Monitor(port, host, username, password, evts) {
	var events = new EventEmitter();

	obj.events = events;

	if(!Array.isArray(evts)){
		process.stderr.write('You need inform at least one event in an Array to Monitor: \n' + JSON.stringify(evts));
		return;
	}else{
		var peers = [];
		var trunks = [];
		evts.forEach(function(data){
			if(typeof data === 'object'){
				Object.keys(data).forEach(function(key){
					if(key === 'peers'){
						peers = data[key];
					}
				});
			}else if(typeof data === 'string'){
				if(data === 'peers'){
						peers = ['all'];
				}
			}
		});
	}
	obj.peers = peers;
	obj.trunks = trunks;

	var ami = require('asterisk-manager')(
        port,
        host,
        username,
        password,
				true);

	ami.keepConnected();

	ami.on('connect', function(e) {
		obj.events.emit('connect', { status: 'connected' });
	});

	ami.on('close', function(e) {
		obj.events.emit('error', { status: 'error', message: e});
	});

	// Get all events. For debug only
	// ami.on('managerevent',function(evt,x){
  //    console.log('EVENT: %s', JSON.stringify(evt));
	// });

	if(obj.peers.length > 0){

		var status = require('./lib/status').Status(ami, obj);

		var state = require('./lib/state').State(ami, obj);

		var state = require('./lib/calls').OnCall(ami, obj);
	}

	return obj;
}

module.exports = Monitor;
