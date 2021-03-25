var Rx = require('rx');

module.exports.OnCall = function(ami, obj){
  var bill = {};
  var bridge = {}
  var newstate = Rx.Observable.fromEvent(ami, 'newstate');
  var hangup = Rx.Observable.fromEvent(ami, 'hangup');
  var originate = Rx.Observable.fromEvent(ami, 'originateresponse');
  var attransfer = Rx.Observable.fromEvent(ami, 'attendedtransfer');
  var bltransfer = Rx.Observable.fromEvent(ami, 'blindtransfer');
  var newstates = Rx.Observable.merge(newstate, originate, attransfer, bltransfer, hangup);

  var statesubscribe = newstates.subscribe(
  function(data){

    var expr = /(SIP|PJSIP|IAX2)\//g;

    if(data.event === 'AttendedTransfer'){
      if(expr.test(data.origtransfererchannel)){

        var date = new Date();

        var endpoint = data.origtransfererchannel.split('-')[0].split('/')[1];

        if(obj.peers.contains('all') || obj.peers.contains(endpoint)){
          obj.events.emit('transfer', {
            type: 'atxtransfer',
            from: data.origtransfererchannel.split('-')[0],
            peer: endpoint,
            destination: data.transfertargetexten,
            calldate: date,
            origtransferee: data.transfereecalleridname,
            uniqueid: data.transfertargetuniqueid
          });
        }

      }
    }

    if(expr.test(data.channel)){

      var date = new Date();

      var endpoint = data.channel.split('-')[0].split('/')[1];

      if(data.event === 'Newstate'){
        if(obj.peers.contains('all') || obj.peers.contains(endpoint)){

          if(data.uniqueid == data.linkedid && !bill[data.uniqueid]){
            if(data.exten != "") {
              var destination = data.exten
            }else if(data.connectedlinename){
              var destination = data.connectedlinename
            }else{
              var destination = data.calleridnum
            }
            bill[data.uniqueid] = {
              type: 'call',
              calldate: date,
              uniqueid: data.uniqueid,
              linkedid: data.linkedid,
              state: data.channelstate,
              statedesc: data.channelstatedesc,
              destination: destination,
              from: data.calleridnum,
              peer: endpoint
            }

            obj.events.emit('oncall', bill[data.uniqueid]);

          }

          if(data.uniqueid != data.linkedid && bill[data.linkedid]){

            bridge[data.uniqueid] = {
              type: 'call',
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

      if(data.event === 'OriginateResponse'){

        obj.events.emit('click-to-call', {
          type: 'call',
          from: data.channel.split('-')[0],
          peer: endpoint,
          destination: data.exten ,
          calldate: date,
          uniqueid: data.uniqueid,
          callid: data.actionid
        });

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
