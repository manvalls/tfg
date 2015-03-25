var Emitter = require('y-emitter'),
    Hub = require('iku-hub/client'),
    Wsp = require('i-peer/ws'),
    Su = require('u-su'),
    elem = require('u-elem'),
    walk = require('y-walk'),
    frame = require('y-timers/frame'),
    wait = require('y-timers/wait'),
    
    stream = require('./stream.js'),
    ctx = require('./context.js'),
    
    emitter = Su(),
    room = Su(),
    peer = Su(),
    anal = Su(),
    hub = Su(),
    color = Su(),
    cbc = Su(),
    
    hearMyself = false,
    
    osc1,osc2,
    Core,outStream,analyser;

walk(function*(){
  var real = new Float32Array([0,1/2]),
      imag = new Float32Array([0,0]),
      wave = ctx.createPeriodicWave(real,imag),
      gain1 = ctx.createGain(),
      gain2 = ctx.createGain(),
      src,dest,audio,f1,f2;
  
  try{ src = ctx.createMediaStreamSource(yield stream); }
  catch(e){ return; }
  
  analyser = ctx.createAnalyser();
  analyser.smoothingTimeConstant = 0.2;
  analyser.fftSize = 32;
  
  gain1.gain.value = 0;
  gain2.gain.value = 0;
  
  osc1 = ctx.createOscillator();
  osc1.setPeriodicWave(wave);
  
  osc1.connect(gain1);
  
  osc2 = ctx.createOscillator();
  osc2.setPeriodicWave(wave);
  
  osc2.connect(gain1.gain);
  gain1.connect(gain2.gain);
  
  f2 = ctx.createBiquadFilter();
  f2.type = 'lowpass';
  f2.frequency.value = ctx.sampleRate / 4;
  
  f1 = ctx.createBiquadFilter();
  f1.type = 'lowpass';
  f1.frequency.value = ctx.sampleRate / 4;
  
  src.connect(f1);
  f1.connect(gain2);
  gain2.connect(f2);
  f2.connect(analyser);
  
  dest = ctx.createMediaStreamDestination();
  analyser.connect(dest);
  
  osc1.frequency.value = ctx.sampleRate / 4;
  osc2.frequency.value = ctx.sampleRate / 4;
  
  osc1.start(0);
  osc2.start(0);
  
  outStream = dest.stream;
  
  if(hearMyself){
    audio = new Audio();
    audio.src = URL.createObjectURL(outStream);
    audio.play();
  }
  
});

function onMsg(msg,en,peer){
  if(typeof msg == 'object') peer.give('fft',msg);
  else peer.give('color',msg);
}

function onClosed(msg,en,peer){
  peer.target.audio.pause();
  peer.set('closed');
}

function* onStream(stream,en,core,cbc){
  var peer = new Emitter();
  
  peer.target.audio = elem(['audio',{src: URL.createObjectURL(stream)}]);
  peer.target.audio.play();
  
  cbc.detach();
  
  this.on('msg',onMsg,peer);
  this.once('closed',onClosed,peer);
  
  core[emitter].give('peer',peer.target);
  if(this[color]) peer.give('color',this[color]);
}

function onMsgPrev(msg){
  if(typeof msg == 'string') this[color] = msg;
}

function* onPeer(peer,en,core){
  var cbc;
  
  peer.sendStream(outStream);
  if(core[color]) peer.send(core[color]);
  
  cbc = peer.on('msg',onMsgPrev);
  peer.on('stream',onStream,core,cbc);
}

function* setReady(hub,core,name){
  var server = yield hub.until('server'),
      r,data;
  
  try{ yield stream; }
  catch(e){
    core[emitter].set('error',e);
    hub.close();
    return;
  }
  
  core[peer] = new Emitter();
  
  server.send(name);
  r = yield this[room];
  
  core[emitter].give('peer',core[peer].target);
  core[emitter].set('ready');
  
  r.on('peer',onPeer,core);
  
  while(true){
    yield wait(100);
    yield hub.until('server');
    
    data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    data = Array.prototype.slice.call(data,0,8);
    
    r.send(data);
    core[peer].give('fft',data);
  }
  
}

function onceClosed(e,en,core){
  core[peer].set('closed');
  core[emitter].unset('ready');
  core[emitter].set('closed');
}

Core = module.exports = function Core(name){
  var h = new Hub(Wsp('.hub'));
  
  Emitter.Target.call(this,emitter);
  h.once('closed',onceClosed,this);
  
  this[hub] = h;
  this[room] = h.until('room');
  
  this.walk(setReady,[h,this,name]);
};

Core.prototype = new Emitter.Target();
Core.prototype.constructor = Core;

Object.defineProperties(Core.prototype,{
  
  close: {value: function(){
    this[hub].close();
  }},
  
  setColor: {value: walk.wrap(function*(c){
    (yield this[room]).send(c);
    this[color] = c;
    this[peer].give('color',c);
  })}
  
});

Core.setDistortion = walk.wrap(function*(d){
  yield stream;
  osc2.frequency.value = ctx.sampleRate / 4 - d * 200;
});

