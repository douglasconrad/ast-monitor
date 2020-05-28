var Rx = require('rx');

module.exports.State = function(ami, obj){
  var bill = {};
  var bridge = {}
  var newstate = Rx.Observable.fromEvent(ami, 'devicestatechange');
  var newstates = Rx.Observable.merge(newstate);

  var statesubscribe = newstates.subscribe(
  function(data){
    var expr = /(SIP|PJSIP|IAX2)\//g;
    if(expr.test(data.device)){
      var peer = data.device.split('/')[1];


    	if(obj.peers.contains('all') || obj.peers.contains(peer)){

      	if(data.state.toLowerCase() == 'busy'){
    			obj.events.emit('state', { peer: peer, state: 'busy' });
    		}
    		if(data.state.toLowerCase() == 'ringing'){
    			obj.events.emit('state', { peer: peer, state: 'ringing' });
    		}
        if(data.state.toLowerCase() == 'not_inuse'){
    			obj.events.emit('state', { peer: peer, state: 'not_inuse' });
    		}

      }
    }

  },function(err){
      console.error('Error in AMI: %s', err);
    }
  );

}
