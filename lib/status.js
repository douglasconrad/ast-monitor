var Rx = require('rx');

module.exports.Status = function(ami, obj){
  var bill = {};
  var bridge = {}
  var newstate = Rx.Observable.fromEvent(ami, 'peerstatus');
  var newstates = Rx.Observable.merge(newstate);

  var statesubscribe = newstates.subscribe(
  function(data){
    var peer = data.peer.split('/')[1];


  	if(obj.peers.contains('all') || obj.peers.contains(peer)){

    	if(data.peerstatus.toLowerCase() == 'registered'){
  			obj.events.emit('online', { peer: peer, status: 'registered', address: data.address });
  		}
  		if(data.peerstatus.toLowerCase() == 'unregistered'){
  			obj.events.emit('offline', { peer: peer, status: 'unregistered', address: data.address, cause: data.cause });
  		}
  		if(data.peerstatus.toLowerCase() == 'unreachable'){
  			obj.events.emit('offline', { peer: peer, status: 'unreachable' });
  		}
  		if(data.peerstatus.toLowerCase() == 'lagged'){
  			obj.events.emit('lagged', { peer: peer, status: 'lagged', address: data.address, cause: data.cause });
  		}

    }

  },function(err){
      console.error('Error in AMI: %s', err);
    }
  );

}
