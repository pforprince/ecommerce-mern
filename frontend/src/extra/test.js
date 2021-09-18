import JsSIP from 'jssip';

var outgoingSession = null;
var incomingSession = null;
var currentSession = null;
var videoView = document.getElementById('videoView');
var text = 'How are you Bob!';
var constraints = {
  audio: true,
  video: true,
  mandatory: {
    maxWidth: 640,
    maxHeight: 360
  }
};
URL = window.URL || window.webkitURL;

var localStream = null;
var userAgent = null;

function gotLocalMedia(stream) {
  console.info('Received local media stream');
  localStream = stream;
  videoView.src = URL.createObjectURL(stream);
}

function captureLocalMedia() {
  console.info('Requesting local video & audio');
  navigator.webkitGetUserMedia(constraints, gotLocalMedia, function (e) {
    alert('getUserMedia() error: ' + e.name);
  });
}

export const initialize = (callback = () => {}) => {

  var sip_uri_ = '20@45.34.23.218';
  var sip_password_ = 'tSuyv7eiH8yF3hc5B7NE';
  var ws_uri_ = 'wss://xx999.com:7443';

  console.info("get input info: sip_uri = ", sip_uri_, " sip_password = ", sip_password_, " ws_uri = ", ws_uri_);

  var socket = new JsSIP.WebSocketInterface(ws_uri_);
  var configuration = {
    sockets: [socket],
    outbound_proxy_set: ws_uri_,
    uri: sip_uri_,
    password: sip_password_,
    register: true,
    session_timers: false
  };

  userAgent = new JsSIP.UA(configuration);

  userAgent.on('registered', function (data) {
    callback(true);
    console.info("registered: ", data.response.status_code, ",", data.response.reason_phrase);
  });

  userAgent.on('registrationFailed', function (data) {
    console.log("registrationFailed, ", data);
    callback(false);
    //console.warn("registrationFailed, ", data.response.status_code, ",", data.response.reason_phrase, " cause - ", data.cause);
  });

  userAgent.on('registrationExpiring', function () {
    console.warn("registrationExpiring");
  });

  userAgent.on('newRTCSession', function (data) {
    // console.info('$$$$$$$$$$ onNewRTCSession: ', data);
    if (data.originator == 'remote') { //incoming call
      console.info("incomingSession, answer the call");
      incomingSession = data.session;
      console.log("incoming");
      data.session.answer({ 'mediaConstraints': { 'audio': true, 'video': false, mandatory: { maxWidth: 640, maxHeight: 360 } }, 'mediaStream': localStream });
    } else {
      console.info("outgoingSession");
      outgoingSession = data.session;
      outgoingSession.on('connecting', function (data) {
        console.info('onConnecting - ', data.request);
        currentSession = outgoingSession;
        outgoingSession = null;
      });
    }
    data.session.on('accepted', function (data) {
      console.info('onAccepted - ', data);
      if (data.originator == 'remote' && currentSession == null) {
        currentSession = incomingSession;
        incomingSession = null;
        console.info("setCurrentSession - ", currentSession);
      }
    });
    data.session.on('confirmed', function (data) {
      console.info('onConfirmed - ', data);
      if (data.originator == 'remote' && currentSession == null) {
        currentSession = incomingSession;
        incomingSession = null;
        console.info("setCurrentSession - ", currentSession);
      }
    });
    data.session.on('sdp', function (data) {
      console.info('onSDP, type - ', data.type, ' sdp - ', data.sdp);
      //data.sdp = data.sdp.replace('UDP/TLS/RTP/SAVPF', 'RTP/SAVPF');
      //console.info('onSDP, changed sdp - ', data.sdp);
    });
    data.session.on('progress', function (data) {
      console.info('onProgress - ', data.originator);
      if (data.originator == 'remote') {
        console.info('onProgress, response - ', data.response);
      }
    });
    data.session.on('peerconnection', function (data) {
      console.info('onPeerconnection - ', data.peerconnection);
      data.peerconnection.onaddstream = function (ev) {
        console.info('onaddstream from remote - ', ev);
        videoView.src = URL.createObjectURL(ev.stream);
      };
    });
  });

  userAgent.on('newMessage', function (data) {
    if (data.originator == 'local') {
      console.info('onNewMessage , OutgoingRequest - ', data.request);
    } else {
      console.info('onNewMessage , IncomingRequest - ', data.request);
    }
    //   var callOptions = {
    //     'eventHandlers'    : eventHandlers,
    //     'mediaConstraints' : { 'audio': true, 'video': false , 
    //                            mandatory: { maxWidth: 640, maxHeight: 360 }
    //       },
    //     }
    //     if (currentSession.direction === "incoming") {
    //       // incoming call here
    //       currentSession.on("accepted",function(){
    //         console.log("incoming session")
    //       });
    //       currentSession.on("confirmed",function(){
    //         console.log("incoming confirmed")
    //           // this handler will be called for incoming calls too
    //       });
    //       currentSession.on("ended",function(){
    //         console.log("incoming ended")
    //           // the call has ended
    //       });
    //       currentSession.on("failed",function(){
    //         console.log("incoming failed")
    //           // unable to establish the call
    //       });


    //       // Answer call
    //       currentSession.answer(callOptions);

    //       // Reject call (or hang up it)
    //       currentSession.terminate();
    //   }
  });

  console.info("call register");
  userAgent.start();
};



const getEventHandlers = (callback) => {

  // Register callbacks to desired call events
  var eventHandlers = {
    'progress': function (e) {
      console.log('call is in progress', e);
    },
    'failed': function (e) {
      console.log('call failed: ', e);
    },
    'ended': function (e) {
      console.log('call ended : ', e);
      callback(false);
    },
    'confirmed': function (e) {
      console.log('call confirmed', e);
      callback(true);
    }
  };

  return eventHandlers;
};

export const testCall = (sip_phone_number_, callback) => {

  var options = {
    'eventHandlers': getEventHandlers(callback),
    'mediaConstraints': {
      'audio': true, 'video': false,
      mandatory: { maxWidth: 640, maxHeight: 360 }
    },
    'mediaStream': localStream,
    'pcConfig': {
      'iceServers': [
        {
          'urls': ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302']
        }
      ]
    }
  };

  //outgoingSession = userAgent.call('sip:3000@192.168.40.96:5060', options);
  outgoingSession = userAgent.call(sip_phone_number_, options);
};

export const toggleMute = (isMuted) => {
  isMuted ? currentSession.unmute() : currentSession.mute();
};

export const hangCall = () => {
  console.log("as0", currentSession);
  currentSession && currentSession.terminate && currentSession.terminate();
};

export const sendMssg = (number, sendMsg) => {
  var eventHandlers1 = {
    'succeeded': function (e) { console.log('sent mssg'); },
    'failed': function (e) { console.log('Failed mssg'); }
  };

  var options = {
    'eventHandlers': eventHandlers1
  };
  fetch('https://api.q222.com/api/v1/sms/create_thread_with_message?user_id=20&from_msisdn=13233320350&to_msisdn=' + number + '&type=SMS&customer_id&device_id&message=' + sendMsg, {
    method: 'POST'
  });


};

  // export const incomingCall=()=>
  // {

  // };