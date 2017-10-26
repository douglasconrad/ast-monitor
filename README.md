# ast-monitor #

Ast-Monitor is a module to monitor events on Asterisk Manager Interface.

It simplify the task to get certain events link a call and its parts (called and caller channels) and join, clean and re-emit the event with a new object.

## Use ##

```
const mon = require('ast-monitor')(AMI_PORT, AMI_HOST, AMI_USER, AMI_PASS, ARRAY_ITEMS_TO_MONITOR);
```

* AMI_PORT: is the Asterisk Manager Interface port. Usually is `5038`
* AMI_HOST: the IP Address of your Asterisk
* AMI_USER: the Asterisk Manager User defined on your `/etc/asterisk/manager.conf`
* AMI_PASS: the Asterisk Manager User Password
* ARRAY_ITEMS_TO_MONITOR: this is an array with the items you want monitor. It can be: `trunks` or `peers`
  * the array content can be a string with the item like `peers`, that means `Monitor all peers`, or an object with an array list of peer you want monitor like `{'peers': ['8020','8021']}` that means `Monitor the peers 8020 and 8021`


```
const mon = require('ast-monitor')('5038','192.168.10.252','snep','sneppass',[{'peers':['8029','8014']}]);

mon.events.on('online', function(data){
	console.log('Online: %s', JSON.stringify(data));
});

mon.events.on('offline', function(data){
	console.log('Offline: %s', JSON.stringify(data));
});

mon.events.on('oncall', function(data){
	console.log('OnCall: %s', JSON.stringify(data));
});

mon.events.on('hangup', function(data){
	console.log('Hangup: %s', JSON.stringify(data));
});

mon.events.on('state', function(data){
	console.log('State: %s', JSON.stringify(data));
});
mon.events.on('connected', function(data){
	console.log('Connected:');
	console.log(data);
});

mon.events.on('error', function(data){
	console.log('error:');
	console.log(data);
});
```
