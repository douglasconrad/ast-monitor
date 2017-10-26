var Rx = require('rx');

module.exports.OnCall = function(ami, obj){
  var bill = {};
  var bridge = {}
  var newstate = Rx.Observable.fromEvent(ami, 'newstate');
  var hangup = Rx.Observable.fromEvent(ami, 'hangup');
  var newstates = Rx.Observable.merge(newstate, hangup);

  var statesubscribe = newstates.subscribe(
  function(data){

    var date = new Date();

    var endpoint = data.channel.split('-')[0].split('/')[1];

    if(data.event === 'Newstate'){
      if(obj.peers.contains(endpoint)){

        if(data.uniqueid == data.linkedid && !bill[data.uniqueid]){

          bill[data.uniqueid] = {
            type: 'outgoing',
            calldate: date,
            uniqueid: data.uniqueid,
            linkedid: data.linkedid,
            state: data.channelstate,
            statedesc: data.channelstatedesc,
            destination: data.exten,
            from: data.calleridnum,
            peer: endpoint
          }

          obj.events.emit('oncall', bill[data.uniqueid]);

        }

        if(data.uniqueid != data.linkedid && bill[data.linkedid]){

          bridge[data.uniqueid] = {
            type: 'incoming',
            calldate: date,
            uniqueid: data.uniqueid,
            linkedid: data.linkedid,
            state: data.channelstate,
            statedesc: data.channelstatedesc,
            destination: bill[data.linkedid].destination,
            from: bill[data.linkedid].from,
            peer: endpoint
          }

          obj.events.emit('oncall', bridge[data.uniqueid]);

        }
      }

    }

    if(data.event === 'Hangup'){

      if(bill[data.uniqueid]){

        bill[data.uniqueid].hangupdate = date;
        obj.events.emit('hangup', bill[data.uniqueid])

      }

      if(bridge[data.uniqueid]){

         bridge[data.uniqueid].hangupdate = date;
         obj.events.emit('hangup', bridge[data.uniqueid])

      }
    }

  },function(err){
      console.error('Error in AMI: %s', err);
    }
  );

}
