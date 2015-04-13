// developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener

(function() {
  if (!Event.prototype.preventDefault) {
    Event.prototype.preventDefault=function() {
      this.returnValue=false;
    };
  }
  if (!Event.prototype.stopPropagation) {
    Event.prototype.stopPropagation=function() {
      this.cancelBubble=true;
    };
  }
  if (!Element.prototype.addEventListener) {
    var eventListeners=[];
    
    var addEventListener=function(type,listener /*, useCapture (will be ignored) */) {
      var self=this;
      var wrapper=function(e) {
        e.target=e.srcElement;
        e.currentTarget=self;
        if (listener.handleEvent) {
          listener.handleEvent(e);
        } else {
          listener.call(self,e);
        }
      };
      if (type=="DOMContentLoaded") {
        var wrapper2=function(e) {
          if (document.readyState=="complete") {
            wrapper(e);
          }
        };
        document.attachEvent("onreadystatechange",wrapper2);
        eventListeners.push({object:this,type:type,listener:listener,wrapper:wrapper2});
        
        if (document.readyState=="complete") {
          var e=new Event();
          e.srcElement=window;
          wrapper2(e);
        }
      } else {
        this.attachEvent("on"+type,wrapper);
        eventListeners.push({object:this,type:type,listener:listener,wrapper:wrapper});
      }
    };
    var removeEventListener=function(type,listener /*, useCapture (will be ignored) */) {
      var counter=0;
      while (counter<eventListeners.length) {
        var eventListener=eventListeners[counter];
        if (eventListener.object==this && eventListener.type==type && eventListener.listener==listener) {
          if (type=="DOMContentLoaded") {
            this.detachEvent("onreadystatechange",eventListener.wrapper);
          } else {
            this.detachEvent("on"+type,eventListener.wrapper);
          }
          eventListeners.splice(counter, 1);
          break;
        }
        ++counter;
      }
    };
    Element.prototype.addEventListener=addEventListener;
    Element.prototype.removeEventListener=removeEventListener;
    if (HTMLDocument) {
      HTMLDocument.prototype.addEventListener=addEventListener;
      HTMLDocument.prototype.removeEventListener=removeEventListener;
    }
    if (Window) {
      Window.prototype.addEventListener=addEventListener;
      Window.prototype.removeEventListener=removeEventListener;
    }
  }
})();




(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var elem = require('u-elem'),
    Class = require('u-css/class'),
    on = require('u-proto/on'),
    
    Core = require('./conference/core.js'),
    loading = require('./conference/loading.js'),
    Peer = require('./conference/Peer.js'),
    colors = require('./conference/colors.js'),
    font = require('./font.js'),
    
    active = false,
    name,prev,conf,
    peerCont,colorsCont,
    container,dist;

// Container

module.exports = container = elem(['div',
  {
    style: {
      width: '100%',
      height: '100%',
      
      position: 'absolute',
      top: '0%',
      left: '100%',
      
      transition: 'all 1s'
    }
  }
]);

conf = elem(['div',
  {
    style: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      
      width: '100%',
      height: '100%',
      
      position: 'absolute',
      zIndex: 1,
      
      top: '0%',
      left: '0%'
    }
  }
]);

container.appendChild(loading);
container.appendChild(conf);

// Colors

colorsCont = elem(['div',
  {style: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    flexWrap: 'wrap'
  }}
]);

conf.appendChild(colorsCont);

(function(){
  var keys = Object.keys(colors),
      colorClass,i,j,pc,e;
  
  function onClick(e,cbc,color){
    if(pc) pc.style.outline = 'none';
    pc = this;
    
    this.style.outline = '2px solid ' + colors[color][0];
    localStorage.color = color;
    prev.setColor(color);
  }
  
  for(j = 0;j < keys.length;j++){
    i = keys[j];
    
    colorClass = new Class().apply({
      backgroundColor: colors[i][1],
      width: '20px',
      height: '20px',
      margin: '5px',
      cursor: 'pointer'
    });
    
    colorClass.psc('hover').apply({
      outline: '2px solid ' + colors[i][0]
    });
    
    colors[i].e = e = elem(['div',{className: colorClass}]);
    e[on]('click',onClick,i);
    colorsCont.appendChild(e);
  }
  
  if(!colors[localStorage.color]) localStorage.color = keys[Math.floor(Math.random() * keys.length)];
  
})();

// Peers

peerCont = elem(['div',
  {style: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    
    margin: '30px'
  }}
]);

conf.appendChild(peerCont);

// Distortion

dist = elem(['input',{
  type: 'range',
  min: 0,
  max: 1,
  step: 0.001,
  style: {width: '120px'}
}]);

localStorage.distortion = localStorage.distortion || 0;
Core.setDistortion(parseFloat(dist.value = localStorage.distortion));

dist[on]('input',function(){
  Core.setDistortion(parseFloat(localStorage.distortion = dist.value));
});

elem([conf,['div','Efecto Wall-E:',{style: {fontFamily: font,fontSize: 'large',margin: '3px'}}],dist,
  ['div',{style: {width: '120px',position: 'relative',fontFamily: font}},
    ['span','0',{style: {position: 'absolute',left: '0px'}}],
    ['span','200',{style: {position: 'absolute',right: '0px'}}]
  ],
  ['div',{style: {width: '120px',fontFamily: font,textAlign: 'center'}},'Hz']
]);


// API

Object.defineProperties(container,{
  
  active: {
    
    get: function(){
      return active;
    },
    
    set: function(v){
      v = !!v;
      
      if(active == v) return;
      active = v;
      
      if(active) container.style.left = '0%';
      else container.style.left = '100%';
    }
    
  },
  
  name: {
    
    set: function(n){
      if(n === name) return;
      if(prev){
        prev.cready.detach();
        prev.cclosed.detach();
        prev.close();
      }
      
      loading.style.display = 'flex';
      
      name = n;
      prev = new Core(name);
      
      prev.on('peer',onPeer);
      prev.cready = prev.once('ready',onceReady);
      prev.cclosed = prev.once('closed',onceClosed);
      prev.once('error',onceError);
    },
    
    get: function(){
      return name;
    }
    
  }
  
});

function onPeer(peer){
  var p = new Peer(peer.audio);
  
  peer.on('color',onColor,p);
  peer.on('fft',onFFT,p);
  peer.once('closed',oncePeerClosed,p);
  peerCont.appendChild(p.container);
}

function onFFT(fft,cbc,peer){
  peer.setFFT(fft);
}

function onColor(color,cbc,peer){
  peer.setColor(color);
}

function oncePeerClosed(e,cbc,peer){
  peer.container.remove();
}

function onceReady(){
  loading.style.display = 'none';
  colors[localStorage.color].e.click();
}

function onceError(){
  alert('Imposible acceder al micro');
  location.href = document.baseURI;
  
  this.cclosed.detach();
}

function onceClosed(){
  location.reload();
}


},{"./conference/Peer.js":2,"./conference/colors.js":3,"./conference/core.js":5,"./conference/loading.js":6,"./font.js":8,"u-css/class":106,"u-elem":112,"u-proto/on":114}],2:[function(require,module,exports){
var elem = require('u-elem'),
    on = require('u-proto/on'),
    Class = require('u-css/class'),
    Su = require('u-su'),
    fft = Su(),
    fftSize = 8,
    width = 100,
    height = 0.7 * width,
    barHeight = 0.9 * height,
    fftClass = new Class().apply({
  width: width + 'px',
  height: height + 'px',
  backgroundColor: 'black',
  margin: '2px'
}),
    rangeClass = new Class().apply({
  width: width + 'px',
  margin: '2px',
  marginTop: '3px'
}),
    contClass = new Class().apply({
  display: 'inline-block',
  margin: '5px'
}),
    colors = require('./colors.js'),
    font = require('../font.js'),
    ctx = require('./context.js'),
    Peer;

function onRangeInput(e, cbc, audio) {
  audio.volume = parseFloat(this.value);
}

Peer = module.exports = function Peer(audio) {
  var range, i, markers;

  this.container = elem(['div', { className: contClass }]);

  this[fft] = {};

  this[fft].container = elem(['div', { className: fftClass }, this[fft].barContainer = elem(['div', { style: { height: barHeight + 'px' } }]), this[fft].line = elem(['div', { style: { height: height - barHeight + 'px', position: 'relative' } }])]);

  this[fft].bars = [];
  for (i = 0; i < fftSize; i++) {

    this[fft].bars[i] = elem(['div', {
      style: {
        backgroundColor: 'inherit',
        transition: 'height 100ms linear',

        width: width / fftSize + 'px',
        height: '0px',

        position: 'absolute',
        bottom: '100%',
        left: i * width / fftSize + 'px'
      }
    }]);

    this[fft].line.appendChild(this[fft].bars[i]);
  }

  this.container.appendChild(this[fft].container);

  markers = elem(['div', { style: { fontFamily: font, position: 'relative' } }]);
  this.container.appendChild(markers);

  elem([markers, ['span', '0', { style: {
      position: 'absolute',
      top: '0%',
      left: '0%'
    } }], ['div', { style: {
      backgroundColor: 'black',
      width: '1px',
      height: '6px',
      position: 'absolute',
      top: '-2px',
      left: '2px'
    } }]]);

  elem([markers, ['span', Math.round(ctx.sampleRate * 10 / 1000 / 4 / 2) / 10, { style: {
      position: 'absolute',
      width: '30px',
      textAlign: 'center',
      top: '0%',
      left: (width + 4) / 2 - 15 + 'px'
    } }], ['div', { style: {
      backgroundColor: 'black',
      width: '1px',
      height: '6px',
      position: 'absolute',
      top: '-2px',
      left: '50%'
    } }]]);

  elem([markers, ['span', Math.round(ctx.sampleRate * 10 / 1000 / 4) / 10, { style: {
      position: 'absolute',
      top: '0%',
      right: '0%'
    } }], ['div', { style: {
      backgroundColor: 'black',
      width: '1px',
      height: '6px',
      position: 'absolute',
      top: '-2px',
      right: '2px'
    } }]]);

  elem([this.container, ['br'], ['div', 'kHz', { style: { fontFamily: font, textAlign: 'center' } }]]);

  if (audio) {

    range = elem(['input', {
      type: 'range',
      className: rangeClass,
      min: 0,
      max: 1,
      step: 0.01
    }]);

    elem([this.container, ['div', 'Volumen:', { style: {
        textAlign: 'center',
        fontFamily: font,
        marginTop: '2px'
      } }], range]);

    range.value = audio.volume;
    range[on]('input', onRangeInput, audio);
  }
};

Peer.prototype.setColor = function (color) {
  this[fft].line.style.backgroundColor = colors[color][0];
  this[fft].barContainer.style.backgroundColor = colors[color][1];
};

Peer.prototype.setFFT = function (fftData) {
  var i;

  for (i = 0; i < fftSize; i++) {
    this[fft].bars[i].style.height = fftData[i] * barHeight / 255 + 'px';
  }
};

},{"../font.js":8,"./colors.js":3,"./context.js":4,"u-css/class":106,"u-elem":112,"u-proto/on":114,"u-su":122}],3:[function(require,module,exports){
exports.black = ['#313131', '#7D7D7D'];
exports.blue = ['#3A3E7B', '#707CCB'];
exports.red = ['#9C0F00', '#E6392C'];
exports.yellow = ['#F0A809', '#FFD83D'];
exports.green = ['#43930E', '#70CA35'];
exports.purple = ['#945A90', '#D38FCF'];
exports.brown = ['#7F3917', '#CF7144'];

},{}],4:[function(require,module,exports){
module.exports = new AudioContext();

},{}],5:[function(require,module,exports){
var _core = require('babel-runtime/core-js')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var onStream = _regeneratorRuntime.mark(function onStream(stream, en, core, cbc) {
  var peer;
  return _regeneratorRuntime.wrap(function onStream$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        peer = new Emitter();

        peer.target.audio = elem(['audio', { src: URL.createObjectURL(stream) }]);
        peer.target.audio.play();

        cbc.detach();

        this.on('msg', onMsg, peer);
        this.once('closed', onClosed, peer);

        core[emitter].give('peer', peer.target);
        if (this[color]) peer.give('color', this[color]);

      case 8:
      case 'end':
        return context$1$0.stop();
    }
  }, onStream, this);
});

var onPeer = _regeneratorRuntime.mark(function onPeer(peer, en, core) {
  var cbc;
  return _regeneratorRuntime.wrap(function onPeer$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:

        peer.sendStream(outStream);
        if (core[color]) peer.send(core[color]);

        cbc = peer.on('msg', onMsgPrev);
        peer.on('stream', onStream, core, cbc);

      case 4:
      case 'end':
        return context$1$0.stop();
    }
  }, onPeer, this);
});

var setReady = _regeneratorRuntime.mark(function setReady(hub, core, name) {
  var server, r, data;
  return _regeneratorRuntime.wrap(function setReady$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return hub.until('server');

      case 2:
        server = context$1$0.sent;
        context$1$0.prev = 3;
        context$1$0.next = 6;
        return stream;

      case 6:
        context$1$0.next = 13;
        break;

      case 8:
        context$1$0.prev = 8;
        context$1$0.t11 = context$1$0['catch'](3);

        core[emitter].set('error', context$1$0.t11);
        hub.close();
        return context$1$0.abrupt('return');

      case 13:

        core[peer] = new Emitter();

        server.send(name);
        context$1$0.next = 17;
        return this[room];

      case 17:
        r = context$1$0.sent;

        core[emitter].give('peer', core[peer].target);
        core[emitter].set('ready');

        r.on('peer', onPeer, core);

      case 21:
        if (!true) {
          context$1$0.next = 33;
          break;
        }

        context$1$0.next = 24;
        return wait(100);

      case 24:
        context$1$0.next = 26;
        return hub.until('server');

      case 26:

        data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        data = Array.prototype.slice.call(data, 0, 8);

        r.send(data);
        core[peer].give('fft', data);
        context$1$0.next = 21;
        break;

      case 33:
      case 'end':
        return context$1$0.stop();
    }
  }, setReady, this, [[3, 8]]);
});

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
    osc1,
    osc2,
    Core,
    outStream,
    analyser;

walk(_regeneratorRuntime.mark(function callee$0$0() {
  var real, imag, wave, gain1, gain2, gain3, src, dest, audio, f1, f2;
  return _regeneratorRuntime.wrap(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        real = new Float32Array([0, 1 / 2]), imag = new Float32Array([0, 0]), wave = ctx.createPeriodicWave(real, imag), gain1 = ctx.createGain(), gain2 = ctx.createGain(), gain3 = ctx.createGain();
        context$1$0.prev = 1;
        context$1$0.next = 4;
        return stream;

      case 4:
        context$1$0.t9 = context$1$0.sent;
        src = ctx.createMediaStreamSource(context$1$0.t9);
        context$1$0.next = 11;
        break;

      case 8:
        context$1$0.prev = 8;
        context$1$0.t10 = context$1$0['catch'](1);
        return context$1$0.abrupt('return');

      case 11:

        analyser = ctx.createAnalyser();
        analyser.smoothingTimeConstant = 0.2;
        analyser.fftSize = 32;

        gain1.gain.value = 0;
        gain2.gain.value = 0;
        gain3.gain.value = 2;

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
        f2.connect(gain3);
        gain3.connect(analyser);

        dest = ctx.createMediaStreamDestination();
        analyser.connect(dest);

        osc1.frequency.value = ctx.sampleRate / 4;
        osc2.frequency.value = ctx.sampleRate / 4;

        osc1.start(0);
        osc2.start(0);

        outStream = dest.stream;

        if (hearMyself) {
          audio = new Audio();
          audio.src = URL.createObjectURL(outStream);
          audio.play();
        }

      case 43:
      case 'end':
        return context$1$0.stop();
    }
  }, callee$0$0, this, [[1, 8]]);
}));

function onMsg(msg, en, peer) {
  if (typeof msg == 'object') peer.give('fft', msg);else peer.give('color', msg);
}

function onClosed(msg, en, peer) {
  peer.target.audio.pause();
  peer.set('closed');
}

function onMsgPrev(msg) {
  if (typeof msg == 'string') this[color] = msg;
}

function onceClosed(e, en, core) {
  if (core[peer]) core[peer].set('closed');
  core[emitter].unset('ready');
  core[emitter].set('closed');
}

Core = module.exports = function Core(name) {
  var h = new Hub(Wsp('.hub'));

  Emitter.Target.call(this, emitter);
  h.once('closed', onceClosed, this);

  this[hub] = h;
  this[room] = h.until('room');

  this.walk(setReady, [h, this, name]);
};

Core.prototype = new Emitter.Target();
Core.prototype.constructor = Core;

_core.Object.defineProperties(Core.prototype, {

  close: { value: function value() {
      this[hub].close();
    } },

  setColor: { value: walk.wrap(_regeneratorRuntime.mark(function callee$0$1(c) {
      return _regeneratorRuntime.wrap(function callee$0$1$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
          case 0:
            context$1$0.next = 2;
            return this[room];

          case 2:
            context$1$0.sent.send(c);

            this[color] = c;
            this[peer].give('color', c);

          case 5:
          case 'end':
            return context$1$0.stop();
        }
      }, callee$0$1, this);
    })) }

});

Core.setDistortion = walk.wrap(_regeneratorRuntime.mark(function callee$0$2(d) {
  return _regeneratorRuntime.wrap(function callee$0$2$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return stream;

      case 2:
        osc2.frequency.value = ctx.sampleRate / 4 - d * 200;

      case 3:
      case 'end':
        return context$1$0.stop();
    }
  }, callee$0$2, this);
}));

},{"./context.js":4,"./stream.js":7,"babel-runtime/core-js":11,"babel-runtime/regenerator":95,"i-peer/ws":99,"iku-hub/client":101,"u-elem":112,"u-su":122,"y-emitter":125,"y-timers/frame":128,"y-timers/wait":135,"y-walk":138}],6:[function(require,module,exports){
var Animation = require('u-css/animation'),
    Class = require('u-css/class'),
    elem = require('u-elem'),
    loadAnim = new Animation(),
    loadClass = new Class(),
    loading;

loadAnim.set('from, to', {
  opacity: 0.6
});

loadAnim.set('50%', {
  opacity: 1
});

loadClass.apply({
  animationDuration: '1.5s',
  animationName: loadAnim,
  animationIterationCount: 'infinite',

  backgroundColor: '#252525',
  width: '20px',
  height: '20px',
  margin: '5px',
  borderRadius: '2px'
});

loading = module.exports = elem(['div', {
  style: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',

    position: 'absolute',
    zIndex: 2,
    backgroundColor: 'white',

    top: '0px',
    left: '0px',

    width: '100%',
    height: '100%'
  }
}, ['div', {
  className: loadClass }], ['div', {
  className: loadClass,
  style: {
    animationDelay: '-250ms'
  }
}], ['div', {
  className: loadClass,
  style: {
    animationDelay: '-500ms'
  }
}]]);

},{"u-css/animation":104,"u-css/class":106,"u-elem":112}],7:[function(require,module,exports){
var Pair = require('y-callback/pair'),
    Resolver = require('y-resolver'),
    pair;

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

if (navigator.getUserMedia) {
    module.exports = pair = Pair();
    navigator.getUserMedia({ audio: true }, pair[0], pair[1]);
} else module.exports = Resolver.reject();

},{"y-callback/pair":124,"y-resolver":126}],8:[function(require,module,exports){
var Font = require('u-css/font'),
    font;

module.exports = font = new Font();

font.add({
  url: '.files/font.woff',
  style: 'normal',
  weight: '400'
});

},{"u-css/font":107}],9:[function(require,module,exports){
var _core = require('babel-runtime/core-js')['default'];

var elem = require('u-elem'),
    wapp = require('wapp/client'),
    on = require('u-proto/on'),
    font = require('./font.js'),
    active = true,
    container,
    input;

module.exports = container = elem(['div', {
  style: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',

    width: '100%',
    height: '100%',

    position: 'absolute',
    top: '0%',
    right: '0%',

    transition: 'all 1s'
  }
}]);

_core.Object.defineProperty(container, 'active', {

  get: function get() {
    return active;
  },

  set: function set(v) {
    v = !!v;

    if (active == v) {
      return;
    }active = v;

    if (active) {
      container.style.right = '0%';
      input.focus();
    } else {
      container.style.right = '100%';
      input.blur();
    }
  }

});

container.appendChild(elem(['div', 'Nombre de la conferencia:', {
  style: {
    fontFamily: font,
    fontSize: '200%'
  }
}]));

input = elem(['input', {
  type: 'text',
  autofocus: true,
  style: {
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',

    padding: '20px',
    fontSize: '400%',
    fontFamily: font,
    textAlign: 'center',
    color: '#2D2D2D'
  }
}]);

container.appendChild(input);

window[on]('keydown', function (e) {
  if (!active) return;
  if (e.keyCode == 13) wapp.goTo(input.value);else input.focus();
});

},{"./font.js":8,"babel-runtime/core-js":11,"u-elem":112,"u-proto/on":114,"wapp/client":123}],10:[function(require,module,exports){
var wapp = require('wapp/client'),
    apply = require('u-proto/apply'),
    
    frontPage = require('./front-page.js'),
    conference = require('./conference.js');

document.body.style[apply]({
  margin: '0px',
  padding: '0px',
  overflow: 'hidden',
  
  width: window.innerWidth + 'px',
  height: window.innerHeight + 'px'
});

window.addEventListener('resize',function(){
  
  document.body.style[apply]({
    width: window.innerWidth + 'px',
    height: window.innerHeight + 'px'
  });
  
});

document.body.appendChild(frontPage);
document.body.appendChild(conference);

wapp.on('top rsc',function(e){
  frontPage.active = true;
  conference.active = false;
});

wapp.on('rsc',function(e){
  frontPage.active = false;
  conference.active = true;
  conference.name = e.rsc;
});

wapp.start();

},{"./conference.js":1,"./front-page.js":9,"u-proto/apply":113,"wapp/client":123}],11:[function(require,module,exports){
module.exports = {
  "default": require("core-js/library"),
  __esModule: true
};

},{"core-js/library":12}],12:[function(require,module,exports){
require('./shim');
require('./modules/core.dict');
require('./modules/core.iter-helpers');
require('./modules/core.$for');
require('./modules/core.delay');
require('./modules/core.binding');
require('./modules/core.object');
require('./modules/core.array.turn');
require('./modules/core.number.iterator');
require('./modules/core.number.math');
require('./modules/core.string.escape-html');
require('./modules/core.date');
require('./modules/core.global');
require('./modules/core.log');
module.exports = require('./modules/$').core;
},{"./modules/$":26,"./modules/core.$for":38,"./modules/core.array.turn":39,"./modules/core.binding":40,"./modules/core.date":41,"./modules/core.delay":42,"./modules/core.dict":43,"./modules/core.global":44,"./modules/core.iter-helpers":45,"./modules/core.log":46,"./modules/core.number.iterator":47,"./modules/core.number.math":48,"./modules/core.object":49,"./modules/core.string.escape-html":50,"./shim":94}],13:[function(require,module,exports){
'use strict';
// false -> Array#indexOf
// true  -> Array#includes
var $ = require('./$');
module.exports = function(IS_INCLUDES){
  return function(el /*, fromIndex = 0 */){
    var O      = $.toObject(this)
      , length = $.toLength(O.length)
      , index  = $.toIndex(arguments[1], length)
      , value;
    if(IS_INCLUDES && el != el)while(length > index){
      value = O[index++];
      if(value != value)return true;
    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
      if(O[index] === el)return IS_INCLUDES || index;
    } return !IS_INCLUDES && -1;
  };
};
},{"./$":26}],14:[function(require,module,exports){
'use strict';
// 0 -> Array#forEach
// 1 -> Array#map
// 2 -> Array#filter
// 3 -> Array#some
// 4 -> Array#every
// 5 -> Array#find
// 6 -> Array#findIndex
var $   = require('./$')
  , ctx = require('./$.ctx');
module.exports = function(TYPE){
  var IS_MAP        = TYPE == 1
    , IS_FILTER     = TYPE == 2
    , IS_SOME       = TYPE == 3
    , IS_EVERY      = TYPE == 4
    , IS_FIND_INDEX = TYPE == 6
    , NO_HOLES      = TYPE == 5 || IS_FIND_INDEX;
  return function(callbackfn/*, that = undefined */){
    var O      = Object($.assertDefined(this))
      , self   = $.ES5Object(O)
      , f      = ctx(callbackfn, arguments[1], 3)
      , length = $.toLength(self.length)
      , index  = 0
      , result = IS_MAP ? Array(length) : IS_FILTER ? [] : undefined
      , val, res;
    for(;length > index; index++)if(NO_HOLES || index in self){
      val = self[index];
      res = f(val, index, O);
      if(TYPE){
        if(IS_MAP)result[index] = res;            // map
        else if(res)switch(TYPE){
          case 3: return true;                    // some
          case 5: return val;                     // find
          case 6: return index;                   // findIndex
          case 2: result.push(val);               // filter
        } else if(IS_EVERY)return false;          // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
  };
};
},{"./$":26,"./$.ctx":21}],15:[function(require,module,exports){
var $ = require('./$');
function assert(condition, msg1, msg2){
  if(!condition)throw TypeError(msg2 ? msg1 + msg2 : msg1);
}
assert.def = $.assertDefined;
assert.fn = function(it){
  if(!$.isFunction(it))throw TypeError(it + ' is not a function!');
  return it;
};
assert.obj = function(it){
  if(!$.isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};
assert.inst = function(it, Constructor, name){
  if(!(it instanceof Constructor))throw TypeError(name + ": use the 'new' operator!");
  return it;
};
module.exports = assert;
},{"./$":26}],16:[function(require,module,exports){
var $ = require('./$');
// 19.1.2.1 Object.assign(target, source, ...)
module.exports = Object.assign || function(target, source){ // eslint-disable-line no-unused-vars
  var T = Object($.assertDefined(target))
    , l = arguments.length
    , i = 1;
  while(l > i){
    var S      = $.ES5Object(arguments[i++])
      , keys   = $.getKeys(S)
      , length = keys.length
      , j      = 0
      , key;
    while(length > j)T[key = keys[j++]] = S[key];
  }
  return T;
};
},{"./$":26}],17:[function(require,module,exports){
var $        = require('./$')
  , TAG      = require('./$.wks')('toStringTag')
  , toString = {}.toString;
function cof(it){
  return toString.call(it).slice(8, -1);
}
cof.classof = function(it){
  var O, T;
  return it == undefined ? it === undefined ? 'Undefined' : 'Null'
    : typeof (T = (O = Object(it))[TAG]) == 'string' ? T : cof(O);
};
cof.set = function(it, tag, stat){
  if(it && !$.has(it = stat ? it : it.prototype, TAG))$.hide(it, TAG, tag);
};
module.exports = cof;
},{"./$":26,"./$.wks":37}],18:[function(require,module,exports){
'use strict';
var $        = require('./$')
  , ctx      = require('./$.ctx')
  , safe     = require('./$.uid').safe
  , assert   = require('./$.assert')
  , $iter    = require('./$.iter')
  , has      = $.has
  , set      = $.set
  , isObject = $.isObject
  , hide     = $.hide
  , step     = $iter.step
  , isFrozen = Object.isFrozen || $.core.Object.isFrozen
  , ID       = safe('id')
  , O1       = safe('O1')
  , LAST     = safe('last')
  , FIRST    = safe('first')
  , ITER     = safe('iter')
  , SIZE     = $.DESC ? safe('size') : 'size'
  , id       = 0;

function fastKey(it, create){
  // return primitive with prefix
  if(!isObject(it))return (typeof it == 'string' ? 'S' : 'P') + it;
  // can't set id to frozen object
  if(isFrozen(it))return 'F';
  if(!has(it, ID)){
    // not necessary to add id
    if(!create)return 'E';
    // add missing object id
    hide(it, ID, ++id);
  // return object id with prefix
  } return 'O' + it[ID];
}

function getEntry(that, key){
  // fast case
  var index = fastKey(key), entry;
  if(index != 'F')return that[O1][index];
  // frozen object case
  for(entry = that[FIRST]; entry; entry = entry.n){
    if(entry.k == key)return entry;
  }
}

module.exports = {
  getConstructor: function(NAME, IS_MAP, ADDER){
    function C(iterable){
      var that = assert.inst(this, C, NAME);
      set(that, O1, $.create(null));
      set(that, SIZE, 0);
      set(that, LAST, undefined);
      set(that, FIRST, undefined);
      if(iterable != undefined)$iter.forOf(iterable, IS_MAP, that[ADDER], that);
    }
    $.mix(C.prototype, {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function(){
        for(var that = this, data = that[O1], entry = that[FIRST]; entry; entry = entry.n){
          entry.r = true;
          if(entry.p)entry.p = entry.p.n = undefined;
          delete data[entry.i];
        }
        that[FIRST] = that[LAST] = undefined;
        that[SIZE] = 0;
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function(key){
        var that  = this
          , entry = getEntry(that, key);
        if(entry){
          var next = entry.n
            , prev = entry.p;
          delete that[O1][entry.i];
          entry.r = true;
          if(prev)prev.n = next;
          if(next)next.p = prev;
          if(that[FIRST] == entry)that[FIRST] = next;
          if(that[LAST] == entry)that[LAST] = prev;
          that[SIZE]--;
        } return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function(callbackfn /*, that = undefined */){
        var f = ctx(callbackfn, arguments[1], 3)
          , entry;
        while(entry = entry ? entry.n : this[FIRST]){
          f(entry.v, entry.k, this);
          // revert to the last existing entry
          while(entry && entry.r)entry = entry.p;
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function(key){
        return !!getEntry(this, key);
      }
    });
    if($.DESC)$.setDesc(C.prototype, 'size', {
      get: function(){
        return assert.def(this[SIZE]);
      }
    });
    return C;
  },
  def: function(that, key, value){
    var entry = getEntry(that, key)
      , prev, index;
    // change existing entry
    if(entry){
      entry.v = value;
    // create new entry
    } else {
      that[LAST] = entry = {
        i: index = fastKey(key, true), // <- index
        k: key,                        // <- key
        v: value,                      // <- value
        p: prev = that[LAST],          // <- previous entry
        n: undefined,                  // <- next entry
        r: false                       // <- removed
      };
      if(!that[FIRST])that[FIRST] = entry;
      if(prev)prev.n = entry;
      that[SIZE]++;
      // add to index
      if(index != 'F')that[O1][index] = entry;
    } return that;
  },
  getEntry: getEntry,
  getIterConstructor: function(){
    return function(iterated, kind){
      set(this, ITER, {o: iterated, k: kind});
    };
  },
  next: function(){
    var iter  = this[ITER]
      , kind  = iter.k
      , entry = iter.l;
    // revert to the last existing entry
    while(entry && entry.r)entry = entry.p;
    // get next entry
    if(!iter.o || !(iter.l = entry = entry ? entry.n : iter.o[FIRST])){
      // or finish the iteration
      iter.o = undefined;
      return step(1);
    }
    // return step by kind
    if(kind == 'key'  )return step(0, entry.k);
    if(kind == 'value')return step(0, entry.v);
    return step(0, [entry.k, entry.v]);
  }
};
},{"./$":26,"./$.assert":15,"./$.ctx":21,"./$.iter":25,"./$.uid":35}],19:[function(require,module,exports){
'use strict';
var $         = require('./$')
  , safe      = require('./$.uid').safe
  , assert    = require('./$.assert')
  , forOf     = require('./$.iter').forOf
  , has       = $.has
  , isObject  = $.isObject
  , hide      = $.hide
  , isFrozen  = Object.isFrozen || $.core.Object.isFrozen
  , id        = 0
  , ID        = safe('id')
  , WEAK      = safe('weak')
  , LEAK      = safe('leak')
  , method    = require('./$.array-methods')
  , find      = method(5)
  , findIndex = method(6);
function findFrozen(store, key){
  return find.call(store.array, function(it){
    return it[0] === key;
  });
}
// fallback for frozen keys
function leakStore(that){
  return that[LEAK] || hide(that, LEAK, {
    array: [],
    get: function(key){
      var entry = findFrozen(this, key);
      if(entry)return entry[1];
    },
    has: function(key){
      return !!findFrozen(this, key);
    },
    set: function(key, value){
      var entry = findFrozen(this, key);
      if(entry)entry[1] = value;
      else this.array.push([key, value]);
    },
    'delete': function(key){
      var index = findIndex.call(this.array, function(it){
        return it[0] === key;
      });
      if(~index)this.array.splice(index, 1);
      return !!~index;
    }
  })[LEAK];
}

module.exports = {
  getConstructor: function(NAME, IS_MAP, ADDER){
    function C(iterable){
      $.set(assert.inst(this, C, NAME), ID, id++);
      if(iterable != undefined)forOf(iterable, IS_MAP, this[ADDER], this);
    }
    $.mix(C.prototype, {
      // 23.3.3.2 WeakMap.prototype.delete(key)
      // 23.4.3.3 WeakSet.prototype.delete(value)
      'delete': function(key){
        if(!isObject(key))return false;
        if(isFrozen(key))return leakStore(this)['delete'](key);
        return has(key, WEAK) && has(key[WEAK], this[ID]) && delete key[WEAK][this[ID]];
      },
      // 23.3.3.4 WeakMap.prototype.has(key)
      // 23.4.3.4 WeakSet.prototype.has(value)
      has: function(key){
        if(!isObject(key))return false;
        if(isFrozen(key))return leakStore(this).has(key);
        return has(key, WEAK) && has(key[WEAK], this[ID]);
      }
    });
    return C;
  },
  def: function(that, key, value){
    if(isFrozen(assert.obj(key))){
      leakStore(that).set(key, value);
    } else {
      has(key, WEAK) || hide(key, WEAK, {});
      key[WEAK][that[ID]] = value;
    } return that;
  },
  leakStore: leakStore,
  WEAK: WEAK,
  ID: ID
};
},{"./$":26,"./$.array-methods":14,"./$.assert":15,"./$.iter":25,"./$.uid":35}],20:[function(require,module,exports){
'use strict';
var $     = require('./$')
  , $def  = require('./$.def')
  , $iter = require('./$.iter')
  , assertInstance = require('./$.assert').inst;

module.exports = function(NAME, methods, common, IS_MAP, isWeak){
  var Base  = $.g[NAME]
    , C     = Base
    , ADDER = IS_MAP ? 'set' : 'add'
    , proto = C && C.prototype
    , O     = {};
  function fixMethod(KEY, CHAIN){
    var method = proto[KEY];
    if($.FW)proto[KEY] = function(a, b){
      var result = method.call(this, a === 0 ? 0 : a, b);
      return CHAIN ? this : result;
    };
  }
  if(!$.isFunction(C) || !(isWeak || !$iter.BUGGY && proto.forEach && proto.entries)){
    // create collection constructor
    C = common.getConstructor(NAME, IS_MAP, ADDER);
    $.mix(C.prototype, methods);
  } else {
    var inst  = new C
      , chain = inst[ADDER](isWeak ? {} : -0, 1)
      , buggyZero;
    // wrap for init collections from iterable
    if($iter.fail(function(iter){
      new C(iter); // eslint-disable-line no-new
    }) || $iter.DANGER_CLOSING){
      C = function(iterable){
        assertInstance(this, C, NAME);
        var that = new Base;
        if(iterable != undefined)$iter.forOf(iterable, IS_MAP, that[ADDER], that);
        return that;
      };
      C.prototype = proto;
      if($.FW)proto.constructor = C;
    }
    isWeak || inst.forEach(function(val, key){
      buggyZero = 1 / key === -Infinity;
    });
    // fix converting -0 key to +0
    if(buggyZero){
      fixMethod('delete');
      fixMethod('has');
      IS_MAP && fixMethod('get');
    }
    // + fix .add & .set for chaining
    if(buggyZero || chain !== inst)fixMethod(ADDER, true);
  }

  require('./$.cof').set(C, NAME);
  require('./$.species')(C);

  O[NAME] = C;
  $def($def.G + $def.W + $def.F * (C != Base), O);

  // add .keys, .values, .entries, [@@iterator]
  // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
  if(!isWeak)$iter.std(
    C, NAME,
    common.getIterConstructor(), common.next,
    IS_MAP ? 'key+value' : 'value' , !IS_MAP, true
  );

  return C;
};
},{"./$":26,"./$.assert":15,"./$.cof":17,"./$.def":22,"./$.iter":25,"./$.species":32}],21:[function(require,module,exports){
// Optional / simple context binding
var assertFunction = require('./$.assert').fn;
module.exports = function(fn, that, length){
  assertFunction(fn);
  if(~length && that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    };
    case 2: return function(a, b){
      return fn.call(that, a, b);
    };
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    };
  } return function(/* ...args */){
      return fn.apply(that, arguments);
    };
};
},{"./$.assert":15}],22:[function(require,module,exports){
var $          = require('./$')
  , global     = $.g
  , core       = $.core
  , isFunction = $.isFunction;
function ctx(fn, that){
  return function(){
    return fn.apply(that, arguments);
  };
}
// type bitmap
$def.F = 1;  // forced
$def.G = 2;  // global
$def.S = 4;  // static
$def.P = 8;  // proto
$def.B = 16; // bind
$def.W = 32; // wrap
function $def(type, name, source){
  var key, own, out, exp
    , isGlobal = type & $def.G
    , target   = isGlobal ? global : type & $def.S
        ? global[name] : (global[name] || {}).prototype
    , exports  = isGlobal ? core : core[name] || (core[name] = {});
  if(isGlobal)source = name;
  for(key in source){
    // contains in native
    own = !(type & $def.F) && target && key in target;
    if(own && key in exports)continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    if(isGlobal && !isFunction(target[key]))exp = source[key];
    // bind timers to global for call from export context
    else if(type & $def.B && own)exp = ctx(out, global);
    // wrap global constructors for prevent change them in library
    else if(type & $def.W && target[key] == out)!function(C){
      exp = function(param){
        return this instanceof C ? new C(param) : C(param);
      };
      exp.prototype = C.prototype;
    }(out);
    else exp = type & $def.P && isFunction(out) ? ctx(Function.call, out) : out;
    // export
    $.hide(exports, key, exp);
  }
}
module.exports = $def;
},{"./$":26}],23:[function(require,module,exports){
module.exports = function($){
  $.FW   = false;
  $.path = $.core;
  return $;
};
},{}],24:[function(require,module,exports){
// Fast apply
// http://jsperf.lnkit.com/fast-apply/5
module.exports = function(fn, args, that){
  var un = that === undefined;
  switch(args.length){
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
    case 5: return un ? fn(args[0], args[1], args[2], args[3], args[4])
                      : fn.call(that, args[0], args[1], args[2], args[3], args[4]);
  } return              fn.apply(that, args);
};
},{}],25:[function(require,module,exports){
'use strict';
var $                 = require('./$')
  , ctx               = require('./$.ctx')
  , cof               = require('./$.cof')
  , $def              = require('./$.def')
  , assertObject      = require('./$.assert').obj
  , SYMBOL_ITERATOR   = require('./$.wks')('iterator')
  , FF_ITERATOR       = '@@iterator'
  , Iterators         = {}
  , IteratorPrototype = {};
// Safari has byggy iterators w/o `next`
var BUGGY = 'keys' in [] && !('next' in [].keys());
// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
setIterator(IteratorPrototype, $.that);
function setIterator(O, value){
  $.hide(O, SYMBOL_ITERATOR, value);
  // Add iterator for FF iterator protocol
  if(FF_ITERATOR in [])$.hide(O, FF_ITERATOR, value);
}
function defineIterator(Constructor, NAME, value, DEFAULT){
  var proto = Constructor.prototype
    , iter  = proto[SYMBOL_ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT] || value;
  // Define iterator
  if($.FW)setIterator(proto, iter);
  if(iter !== value){
    var iterProto = $.getProto(iter.call(new Constructor));
    // Set @@toStringTag to native iterators
    cof.set(iterProto, NAME + ' Iterator', true);
    // FF fix
    if($.FW)$.has(proto, FF_ITERATOR) && setIterator(iterProto, $.that);
  }
  // Plug for library
  Iterators[NAME] = iter;
  // FF & v8 fix
  Iterators[NAME + ' Iterator'] = $.that;
  return iter;
}
function getIterator(it){
  var Symbol  = $.g.Symbol
    , ext     = it[Symbol && Symbol.iterator || FF_ITERATOR]
    , getIter = ext || it[SYMBOL_ITERATOR] || Iterators[cof.classof(it)];
  return assertObject(getIter.call(it));
}
function closeIterator(iterator){
  var ret = iterator['return'];
  if(ret !== undefined)assertObject(ret.call(iterator));
}
function stepCall(iterator, fn, value, entries){
  try {
    return entries ? fn(assertObject(value)[0], value[1]) : fn(value);
  } catch(e){
    closeIterator(iterator);
    throw e;
  }
}
var DANGER_CLOSING = true;
!function(){
  try {
    var iter = [1].keys();
    iter['return'] = function(){ DANGER_CLOSING = false; };
    Array.from(iter, function(){ throw 2; });
  } catch(e){ /* empty */ }
}();
var $iter = module.exports = {
  BUGGY: BUGGY,
  DANGER_CLOSING: DANGER_CLOSING,
  fail: function(exec){
    var fail = true;
    try {
      var arr  = [[{}, 1]]
        , iter = arr[SYMBOL_ITERATOR]()
        , next = iter.next;
      iter.next = function(){
        fail = false;
        return next.call(this);
      };
      arr[SYMBOL_ITERATOR] = function(){
        return iter;
      };
      exec(arr);
    } catch(e){ /* empty */ }
    return fail;
  },
  Iterators: Iterators,
  prototype: IteratorPrototype,
  step: function(done, value){
    return {value: value, done: !!done};
  },
  stepCall: stepCall,
  close: closeIterator,
  is: function(it){
    var O      = Object(it)
      , Symbol = $.g.Symbol
      , SYM    = Symbol && Symbol.iterator || FF_ITERATOR;
    return SYM in O || SYMBOL_ITERATOR in O || $.has(Iterators, cof.classof(O));
  },
  get: getIterator,
  set: setIterator,
  create: function(Constructor, NAME, next, proto){
    Constructor.prototype = $.create(proto || $iter.prototype, {next: $.desc(1, next)});
    cof.set(Constructor, NAME + ' Iterator');
  },
  define: defineIterator,
  std: function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCE){
    function createIter(kind){
      return function(){
        return new Constructor(this, kind);
      };
    }
    $iter.create(Constructor, NAME, next);
    var entries = createIter('key+value')
      , values  = createIter('value')
      , proto   = Base.prototype
      , methods, key;
    if(DEFAULT == 'value')values = defineIterator(Base, NAME, values, 'values');
    else entries = defineIterator(Base, NAME, entries, 'entries');
    if(DEFAULT){
      methods = {
        entries: entries,
        keys:    IS_SET ? values : createIter('key'),
        values:  values
      };
      $def($def.P + $def.F * BUGGY, NAME, methods);
      if(FORCE)for(key in methods){
        if(!(key in proto))$.hide(proto, key, methods[key]);
      }
    }
  },
  forOf: function(iterable, entries, fn, that){
    var iterator = getIterator(iterable)
      , f = ctx(fn, that, entries ? 2 : 1)
      , step;
    while(!(step = iterator.next()).done){
      if(stepCall(iterator, f, step.value, entries) === false){
        return closeIterator(iterator);
      }
    }
  }
};
},{"./$":26,"./$.assert":15,"./$.cof":17,"./$.ctx":21,"./$.def":22,"./$.wks":37}],26:[function(require,module,exports){
'use strict';
var global = typeof self != 'undefined' ? self : Function('return this')()
  , core   = {}
  , defineProperty = Object.defineProperty
  , hasOwnProperty = {}.hasOwnProperty
  , ceil  = Math.ceil
  , floor = Math.floor
  , max   = Math.max
  , min   = Math.min;
// The engine works fine with descriptors? Thank's IE8 for his funny defineProperty.
var DESC = !!function(){
  try {
    return defineProperty({}, 'a', {get: function(){ return 2; }}).a == 2;
  } catch(e){ /* empty */ }
}();
var hide = createDefiner(1);
// 7.1.4 ToInteger
function toInteger(it){
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
}
function desc(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  };
}
function simpleSet(object, key, value){
  object[key] = value;
  return object;
}
function createDefiner(bitmap){
  return DESC ? function(object, key, value){
    return $.setDesc(object, key, desc(bitmap, value)); // eslint-disable-line no-use-before-define
  } : simpleSet;
}

function isObject(it){
  return it !== null && (typeof it == 'object' || typeof it == 'function');
}
function isFunction(it){
  return typeof it == 'function';
}
function assertDefined(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
}

var $ = module.exports = require('./$.fw')({
  g: global,
  core: core,
  html: global.document && document.documentElement,
  // http://jsperf.com/core-js-isobject
  isObject:   isObject,
  isFunction: isFunction,
  it: function(it){
    return it;
  },
  that: function(){
    return this;
  },
  // 7.1.4 ToInteger
  toInteger: toInteger,
  // 7.1.15 ToLength
  toLength: function(it){
    return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
  },
  toIndex: function(index, length){
    index = toInteger(index);
    return index < 0 ? max(index + length, 0) : min(index, length);
  },
  has: function(it, key){
    return hasOwnProperty.call(it, key);
  },
  create:     Object.create,
  getProto:   Object.getPrototypeOf,
  DESC:       DESC,
  desc:       desc,
  getDesc:    Object.getOwnPropertyDescriptor,
  setDesc:    defineProperty,
  getKeys:    Object.keys,
  getNames:   Object.getOwnPropertyNames,
  getSymbols: Object.getOwnPropertySymbols,
  // Dummy, fix for not array-like ES3 string in es5 module
  assertDefined: assertDefined,
  ES5Object: Object,
  toObject: function(it){
    return $.ES5Object(assertDefined(it));
  },
  hide: hide,
  def: createDefiner(0),
  set: global.Symbol ? simpleSet : hide,
  mix: function(target, src){
    for(var key in src)hide(target, key, src[key]);
    return target;
  },
  each: [].forEach
});
if(typeof __e != 'undefined')__e = core;
if(typeof __g != 'undefined')__g = global;
},{"./$.fw":23}],27:[function(require,module,exports){
var $ = require('./$');
module.exports = function(object, el){
  var O      = $.toObject(object)
    , keys   = $.getKeys(O)
    , length = keys.length
    , index  = 0
    , key;
  while(length > index)if(O[key = keys[index++]] === el)return key;
};
},{"./$":26}],28:[function(require,module,exports){
var $            = require('./$')
  , assertObject = require('./$.assert').obj;
module.exports = function(it){
  assertObject(it);
  return $.getSymbols ? $.getNames(it).concat($.getSymbols(it)) : $.getNames(it);
};
},{"./$":26,"./$.assert":15}],29:[function(require,module,exports){
'use strict';
var $      = require('./$')
  , invoke = require('./$.invoke')
  , assertFunction = require('./$.assert').fn;
module.exports = function(/* ...pargs */){
  var fn     = assertFunction(this)
    , length = arguments.length
    , pargs  = Array(length)
    , i      = 0
    , _      = $.path._
    , holder = false;
  while(length > i)if((pargs[i] = arguments[i++]) === _)holder = true;
  return function(/* ...args */){
    var that    = this
      , _length = arguments.length
      , j = 0, k = 0, args;
    if(!holder && !_length)return invoke(fn, pargs, that);
    args = pargs.slice();
    if(holder)for(;length > j; j++)if(args[j] === _)args[j] = arguments[k++];
    while(_length > k)args.push(arguments[k++]);
    return invoke(fn, args, that);
  };
};
},{"./$":26,"./$.assert":15,"./$.invoke":24}],30:[function(require,module,exports){
'use strict';
module.exports = function(regExp, replace, isStatic){
  var replacer = replace === Object(replace) ? function(part){
    return replace[part];
  } : replace;
  return function(it){
    return String(isStatic ? it : this).replace(regExp, replacer);
  };
};
},{}],31:[function(require,module,exports){
// Works with __proto__ only. Old v8 can't works with null proto objects.
/*eslint-disable no-proto */
var $      = require('./$')
  , assert = require('./$.assert');
module.exports = Object.setPrototypeOf || ('__proto__' in {} // eslint-disable-line
  ? function(buggy, set){
      try {
        set = require('./$.ctx')(Function.call, $.getDesc(Object.prototype, '__proto__').set, 2);
        set({}, []);
      } catch(e){ buggy = true; }
      return function(O, proto){
        assert.obj(O);
        assert(proto === null || $.isObject(proto), proto, ": can't set as prototype!");
        if(buggy)O.__proto__ = proto;
        else set(O, proto);
        return O;
      };
    }()
  : undefined);
},{"./$":26,"./$.assert":15,"./$.ctx":21}],32:[function(require,module,exports){
var $ = require('./$');
module.exports = function(C){
  if($.DESC && $.FW)$.setDesc(C, require('./$.wks')('species'), {
    configurable: true,
    get: $.that
  });
};
},{"./$":26,"./$.wks":37}],33:[function(require,module,exports){
'use strict';
// true  -> String#at
// false -> String#codePointAt
var $ = require('./$');
module.exports = function(TO_STRING){
  return function(pos){
    var s = String($.assertDefined(this))
      , i = $.toInteger(pos)
      , l = s.length
      , a, b;
    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l
      || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
        ? TO_STRING ? s.charAt(i) : a
        : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};
},{"./$":26}],34:[function(require,module,exports){
'use strict';
var $      = require('./$')
  , ctx    = require('./$.ctx')
  , cof    = require('./$.cof')
  , invoke = require('./$.invoke')
  , global             = $.g
  , isFunction         = $.isFunction
  , setTask            = global.setImmediate
  , clearTask          = global.clearImmediate
  , postMessage        = global.postMessage
  , addEventListener   = global.addEventListener
  , MessageChannel     = global.MessageChannel
  , counter            = 0
  , queue              = {}
  , ONREADYSTATECHANGE = 'onreadystatechange'
  , defer, channel, port;
function run(){
  var id = +this;
  if($.has(queue, id)){
    var fn = queue[id];
    delete queue[id];
    fn();
  }
}
function listner(event){
  run.call(event.data);
}
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if(!isFunction(setTask) || !isFunction(clearTask)){
  setTask = function(fn){
    var args = [], i = 1;
    while(arguments.length > i)args.push(arguments[i++]);
    queue[++counter] = function(){
      invoke(isFunction(fn) ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function(id){
    delete queue[id];
  };
  // Node.js 0.8-
  if(cof(global.process) == 'process'){
    defer = function(id){
      global.process.nextTick(ctx(run, id, 1));
    };
  // Modern browsers, skip implementation for WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is object
  } else if(addEventListener && isFunction(postMessage) && !$.g.importScripts){
    defer = function(id){
      postMessage(id, '*');
    };
    addEventListener('message', listner, false);
  // WebWorkers
  } else if(isFunction(MessageChannel)){
    channel = new MessageChannel;
    port    = channel.port2;
    channel.port1.onmessage = listner;
    defer = ctx(port.postMessage, port, 1);
  // IE8-
  } else if($.g.document && ONREADYSTATECHANGE in document.createElement('script')){
    defer = function(id){
      $.html.appendChild(document.createElement('script'))[ONREADYSTATECHANGE] = function(){
        $.html.removeChild(this);
        run.call(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function(id){
      setTimeout(ctx(run, id, 1), 0);
    };
  }
}
module.exports = {
  set:   setTask,
  clear: clearTask
};
},{"./$":26,"./$.cof":17,"./$.ctx":21,"./$.invoke":24}],35:[function(require,module,exports){
var sid = 0;
function uid(key){
  return 'Symbol(' + key + ')_' + (++sid + Math.random()).toString(36);
}
uid.safe = require('./$').g.Symbol || uid;
module.exports = uid;
},{"./$":26}],36:[function(require,module,exports){
// 22.1.3.31 Array.prototype[@@unscopables]
var $           = require('./$')
  , UNSCOPABLES = require('./$.wks')('unscopables');
if($.FW && !(UNSCOPABLES in []))$.hide(Array.prototype, UNSCOPABLES, {});
module.exports = function(key){
  if($.FW)[][UNSCOPABLES][key] = true;
};
},{"./$":26,"./$.wks":37}],37:[function(require,module,exports){
var global = require('./$').g
  , store  = {};
module.exports = function(name){
  return store[name] || (store[name] =
    global.Symbol && global.Symbol[name] || require('./$.uid').safe('Symbol.' + name));
};
},{"./$":26,"./$.uid":35}],38:[function(require,module,exports){
'use strict';
var $       = require('./$')
  , ctx     = require('./$.ctx')
  , safe    = require('./$.uid').safe
  , $def    = require('./$.def')
  , $iter   = require('./$.iter')
  , ENTRIES = safe('entries')
  , FN      = safe('fn')
  , ITER    = safe('iter')
  , forOf          = $iter.forOf
  , stepCall       = $iter.stepCall
  , getIterator    = $iter.get
  , setIterator    = $iter.set
  , createIterator = $iter.create;
function $for(iterable, entries){
  if(!(this instanceof $for))return new $for(iterable, entries);
  this[ITER]    = getIterator(iterable);
  this[ENTRIES] = !!entries;
}

createIterator($for, 'Wrapper', function(){
  return this[ITER].next();
});
var $forProto = $for.prototype;
setIterator($forProto, function(){
  return this[ITER]; // unwrap
});

function createChainIterator(next){
  function Iterator(iter, fn, that){
    this[ITER]    = getIterator(iter);
    this[ENTRIES] = iter[ENTRIES];
    this[FN]      = ctx(fn, that, iter[ENTRIES] ? 2 : 1);
  }
  createIterator(Iterator, 'Chain', next, $forProto);
  setIterator(Iterator.prototype, $.that); // override $forProto iterator
  return Iterator;
}

var MapIter = createChainIterator(function(){
  var step = this[ITER].next();
  return step.done
    ? step
    : $iter.step(0, stepCall(this[ITER], this[FN], step.value, this[ENTRIES]));
});

var FilterIter = createChainIterator(function(){
  for(;;){
    var step = this[ITER].next();
    if(step.done || stepCall(this[ITER], this[FN], step.value, this[ENTRIES]))return step;
  }
});

$.mix($forProto, {
  of: function(fn, that){
    forOf(this, this[ENTRIES], fn, that);
  },
  array: function(fn, that){
    var result = [];
    forOf(fn != undefined ? this.map(fn, that) : this, false, result.push, result);
    return result;
  },
  filter: function(fn, that){
    return new FilterIter(this, fn, that);
  },
  map: function(fn, that){
    return new MapIter(this, fn, that);
  }
});

$for.isIterable  = $iter.is;
$for.getIterator = getIterator;

$def($def.G + $def.F, {$for: $for});
},{"./$":26,"./$.ctx":21,"./$.def":22,"./$.iter":25,"./$.uid":35}],39:[function(require,module,exports){
'use strict';
var $              = require('./$')
  , $def           = require('./$.def')
  , assertFunction = require('./$.assert').fn;
$def($def.P + $def.F, 'Array', {
  turn: function(fn, target /* = [] */){
    assertFunction(fn);
    var memo   = target == undefined ? [] : Object(target)
      , O      = $.ES5Object(this)
      , length = $.toLength(O.length)
      , index  = 0;
    while(length > index)if(fn(memo, O[index], index++, this) === false)break;
    return memo;
  }
});
require('./$.unscope')('turn');
},{"./$":26,"./$.assert":15,"./$.def":22,"./$.unscope":36}],40:[function(require,module,exports){
'use strict';
var $      = require('./$')
  , ctx    = require('./$.ctx')
  , $def   = require('./$.def')
  , invoke = require('./$.invoke')
  , hide   = $.hide
  , assertFunction = require('./$.assert').fn
  // IE8- dirty hack - redefined toLocaleString is not enumerable
  , _ = $.DESC ? require('./$.uid')('tie') : 'toLocaleString'
  , toLocaleString = {}.toLocaleString;

// Placeholder
$.core._ = $.path._ = $.path._ || {};

$def($def.P + $def.F, 'Function', {
  part: require('./$.partial'),
  only: function(numberArguments, that /* = @ */){
    var fn     = assertFunction(this)
      , n      = $.toLength(numberArguments)
      , isThat = arguments.length > 1;
    return function(/* ...args */){
      var length = Math.min(n, arguments.length)
        , args   = Array(length)
        , i      = 0;
      while(length > i)args[i] = arguments[i++];
      return invoke(fn, args, isThat ? that : this);
    };
  }
});

function tie(key){
  var that  = this
    , bound = {};
  return hide(that, _, function(key){ // eslint-disable-line no-shadow
    if(key === undefined || !(key in that))return toLocaleString.call(that);
    return $.has(bound, key) ? bound[key] : bound[key] = ctx(that[key], that, -1);
  })[_](key);
}

hide($.path._, 'toString', function(){
  return _;
});

hide(Object.prototype, _, tie);
$.DESC || hide(Array.prototype, _, tie);
},{"./$":26,"./$.assert":15,"./$.ctx":21,"./$.def":22,"./$.invoke":24,"./$.partial":29,"./$.uid":35}],41:[function(require,module,exports){
var $            = require('./$')
  , $def         = require('./$.def')
  , core         = $.core
  , formatRegExp = /\b\w\w?\b/g
  , flexioRegExp = /:(.*)\|(.*)$/
  , locales      = {}
  , current      = 'en'
  , SECONDS      = 'Seconds'
  , MINUTES      = 'Minutes'
  , HOURS        = 'Hours'
  , DATE         = 'Date'
  , MONTH        = 'Month'
  , YEAR         = 'FullYear';
function lz(num){
  return num > 9 ? num : '0' + num;
}
function createFormat(prefix){
  return function(template, locale /* = current */){
    var that = this
      , dict = locales[$.has(locales, locale) ? locale : current];
    function get(unit){
      return that[prefix + unit]();
    }
    return String(template).replace(formatRegExp, function(part){
      switch(part){
        case 's'  : return get(SECONDS);                  // Seconds : 0-59
        case 'ss' : return lz(get(SECONDS));              // Seconds : 00-59
        case 'm'  : return get(MINUTES);                  // Minutes : 0-59
        case 'mm' : return lz(get(MINUTES));              // Minutes : 00-59
        case 'h'  : return get(HOURS);                    // Hours   : 0-23
        case 'hh' : return lz(get(HOURS));                // Hours   : 00-23
        case 'D'  : return get(DATE);                     // Date    : 1-31
        case 'DD' : return lz(get(DATE));                 // Date    : 01-31
        case 'W'  : return dict[0][get('Day')];           // Day     : Понедельник
        case 'N'  : return get(MONTH) + 1;                // Month   : 1-12
        case 'NN' : return lz(get(MONTH) + 1);            // Month   : 01-12
        case 'M'  : return dict[2][get(MONTH)];           // Month   : Январь
        case 'MM' : return dict[1][get(MONTH)];           // Month   : Января
        case 'Y'  : return get(YEAR);                     // Year    : 2014
        case 'YY' : return lz(get(YEAR) % 100);           // Year    : 14
      } return part;
    });
  };
}
function addLocale(lang, locale){
  function split(index){
    var result = [];
    $.each.call(locale.months.split(','), function(it){
      result.push(it.replace(flexioRegExp, '$' + index));
    });
    return result;
  }
  locales[lang] = [locale.weekdays.split(','), split(1), split(2)];
  return core;
}
$def($def.P + $def.F, DATE, {
  format:    createFormat('get'),
  formatUTC: createFormat('getUTC')
});
addLocale(current, {
  weekdays: 'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
  months: 'January,February,March,April,May,June,July,August,September,October,November,December'
});
addLocale('ru', {
  weekdays: 'Воскресенье,Понедельник,Вторник,Среда,Четверг,Пятница,Суббота',
  months: 'Январ:я|ь,Феврал:я|ь,Март:а|,Апрел:я|ь,Ма:я|й,Июн:я|ь,' +
          'Июл:я|ь,Август:а|,Сентябр:я|ь,Октябр:я|ь,Ноябр:я|ь,Декабр:я|ь'
});
core.locale = function(locale){
  return $.has(locales, locale) ? current = locale : current;
};
core.addLocale = addLocale;
},{"./$":26,"./$.def":22}],42:[function(require,module,exports){
var $       = require('./$')
  , $def    = require('./$.def')
  , partial = require('./$.partial');
// https://esdiscuss.org/topic/promise-returning-delay-function
$def($def.G + $def.F, {
  delay: function(time){
    return new ($.core.Promise || $.g.Promise)(function(resolve){
      setTimeout(partial.call(resolve, true), time);
    });
  }
});
},{"./$":26,"./$.def":22,"./$.partial":29}],43:[function(require,module,exports){
var $        = require('./$')
  , ctx      = require('./$.ctx')
  , $def     = require('./$.def')
  , assign   = require('./$.assign')
  , keyOf    = require('./$.keyof')
  , ITER     = require('./$.uid').safe('iter')
  , assert   = require('./$.assert')
  , $iter    = require('./$.iter')
  , step     = $iter.step
  , getKeys  = $.getKeys
  , toObject = $.toObject
  , has      = $.has;

function Dict(iterable){
  var dict = $.create(null);
  if(iterable != undefined){
    if($iter.is(iterable)){
      $iter.forOf(iterable, true, function(key, value){
        dict[key] = value;
      });
    } else assign(dict, iterable);
  }
  return dict;
}
Dict.prototype = null;

function DictIterator(iterated, kind){
  $.set(this, ITER, {o: toObject(iterated), a: getKeys(iterated), i: 0, k: kind});
}
$iter.create(DictIterator, 'Dict', function(){
  var iter = this[ITER]
    , O    = iter.o
    , keys = iter.a
    , kind = iter.k
    , key;
  do {
    if(iter.i >= keys.length){
      iter.o = undefined;
      return step(1);
    }
  } while(!has(O, key = keys[iter.i++]));
  if(kind == 'key'  )return step(0, key);
  if(kind == 'value')return step(0, O[key]);
  return step(0, [key, O[key]]);
});
function createDictIter(kind){
  return function(it){
    return new DictIterator(it, kind);
  };
}
function generic(A, B){
  // strange IE quirks mode bug -> use typeof instead of isFunction
  return typeof A == 'function' ? A : B;
}

// 0 -> Dict.forEach
// 1 -> Dict.map
// 2 -> Dict.filter
// 3 -> Dict.some
// 4 -> Dict.every
// 5 -> Dict.find
// 6 -> Dict.findKey
// 7 -> Dict.mapPairs
function createDictMethod(TYPE){
  var IS_MAP   = TYPE == 1
    , IS_EVERY = TYPE == 4;
  return function(object, callbackfn, that /* = undefined */){
    var f      = ctx(callbackfn, that, 3)
      , O      = toObject(object)
      , result = IS_MAP || TYPE == 7 || TYPE == 2 ? new (generic(this, Dict)) : undefined
      , key, val, res;
    for(key in O)if(has(O, key)){
      val = O[key];
      res = f(val, key, object);
      if(TYPE){
        if(IS_MAP)result[key] = res;            // map
        else if(res)switch(TYPE){
          case 2: result[key] = val; break;     // filter
          case 3: return true;                  // some
          case 5: return val;                   // find
          case 6: return key;                   // findKey
          case 7: result[res[0]] = res[1];      // mapPairs
        } else if(IS_EVERY)return false;        // every
      }
    }
    return TYPE == 3 || IS_EVERY ? IS_EVERY : result;
  };
}

// true  -> Dict.turn
// false -> Dict.reduce
function createDictReduce(IS_TURN){
  return function(object, mapfn, init){
    assert.fn(mapfn);
    var O      = toObject(object)
      , keys   = getKeys(O)
      , length = keys.length
      , i      = 0
      , memo, key, result;
    if(IS_TURN){
      memo = init == undefined ? new (generic(this, Dict)) : Object(init);
    } else if(arguments.length < 3){
      assert(length, 'Reduce of empty object with no initial value');
      memo = O[keys[i++]];
    } else memo = Object(init);
    while(length > i)if(has(O, key = keys[i++])){
      result = mapfn(memo, O[key], key, object);
      if(IS_TURN){
        if(result === false)break;
      } else memo = result;
    }
    return memo;
  };
}
var findKey = createDictMethod(6);

$def($def.G + $def.F, {Dict: $.mix(Dict, {
  keys:     createDictIter('key'),
  values:   createDictIter('value'),
  entries:  createDictIter('key+value'),
  forEach:  createDictMethod(0),
  map:      createDictMethod(1),
  filter:   createDictMethod(2),
  some:     createDictMethod(3),
  every:    createDictMethod(4),
  find:     createDictMethod(5),
  findKey:  findKey,
  mapPairs: createDictMethod(7),
  reduce:   createDictReduce(false),
  turn:     createDictReduce(true),
  keyOf:    keyOf,
  includes: function(object, el){
    return (el == el ? keyOf(object, el) : findKey(object, function(it){
      return it != it;
    })) !== undefined;
  },
  // Has / get / set own property
  has: has,
  get: function(object, key){
    if(has(object, key))return object[key];
  },
  set: $.def,
  isDict: function(it){
    return $.isObject(it) && $.getProto(it) === Dict.prototype;
  }
})});
},{"./$":26,"./$.assert":15,"./$.assign":16,"./$.ctx":21,"./$.def":22,"./$.iter":25,"./$.keyof":27,"./$.uid":35}],44:[function(require,module,exports){
var $def = require('./$.def');
$def($def.G + $def.F, {global: require('./$').g});
},{"./$":26,"./$.def":22}],45:[function(require,module,exports){
var core  = require('./$').core
  , $iter = require('./$.iter');
core.isIterable  = $iter.is;
core.getIterator = $iter.get;
},{"./$":26,"./$.iter":25}],46:[function(require,module,exports){
var $    = require('./$')
  , $def = require('./$.def')
  , log  = {}
  , enabled = true;
// Methods from https://github.com/DeveloperToolsWG/console-object/blob/master/api.md
$.each.call(('assert,clear,count,debug,dir,dirxml,error,exception,' +
    'group,groupCollapsed,groupEnd,info,isIndependentlyComposed,log,' +
    'markTimeline,profile,profileEnd,table,time,timeEnd,timeline,' +
    'timelineEnd,timeStamp,trace,warn').split(','), function(key){
  log[key] = function(){
    if(enabled && $.g.console && $.isFunction(console[key])){
      return Function.apply.call(console[key], console, arguments);
    }
  };
});
$def($def.G + $def.F, {log: require('./$.assign')(log.log, log, {
  enable: function(){
    enabled = true;
  },
  disable: function(){
    enabled = false;
  }
})});
},{"./$":26,"./$.assign":16,"./$.def":22}],47:[function(require,module,exports){
'use strict';
var $       = require('./$')
  , ITER    = require('./$.uid').safe('iter')
  , $iter   = require('./$.iter')
  , step    = $iter.step
  , NUMBER  = 'Number';
function NumberIterator(iterated){
  $.set(this, ITER, {l: $.toLength(iterated), i: 0});
}
$iter.create(NumberIterator, NUMBER, function(){
  var iter = this[ITER]
    , i    = iter.i++;
  return i < iter.l ? step(0, i) : step(1);
});
$iter.define(Number, NUMBER, function(){
  return new NumberIterator(this);
});
},{"./$":26,"./$.iter":25,"./$.uid":35}],48:[function(require,module,exports){
'use strict';
var $       = require('./$')
  , $def    = require('./$.def')
  , invoke  = require('./$.invoke')
  , methods = {};

methods.random = function(lim /* = 0 */){
  var a = +this
    , b = lim == undefined ? 0 : +lim
    , m = Math.min(a, b);
  return Math.random() * (Math.max(a, b) - m) + m;
};

if($.FW)$.each.call((
    // ES3:
    'round,floor,ceil,abs,sin,asin,cos,acos,tan,atan,exp,sqrt,max,min,pow,atan2,' +
    // ES6:
    'acosh,asinh,atanh,cbrt,clz32,cosh,expm1,hypot,imul,log1p,log10,log2,sign,sinh,tanh,trunc'
  ).split(','), function(key){
    var fn = Math[key];
    if(fn)methods[key] = function(/* ...args */){
      // ie9- dont support strict mode & convert `this` to object -> convert it to number
      var args = [+this]
        , i    = 0;
      while(arguments.length > i)args.push(arguments[i++]);
      return invoke(fn, args);
    };
  }
);

$def($def.P + $def.F, 'Number', methods);
},{"./$":26,"./$.def":22,"./$.invoke":24}],49:[function(require,module,exports){
var $       = require('./$')
  , $def    = require('./$.def')
  , ownKeys = require('./$.own-keys');
function define(target, mixin){
  var keys   = ownKeys($.toObject(mixin))
    , length = keys.length
    , i = 0, key;
  while(length > i)$.setDesc(target, key = keys[i++], $.getDesc(mixin, key));
  return target;
}
$def($def.S + $def.F, 'Object', {
  isObject: $.isObject,
  classof: require('./$.cof').classof,
  define: define,
  make: function(proto, mixin){
    return define($.create(proto), mixin);
  }
});
},{"./$":26,"./$.cof":17,"./$.def":22,"./$.own-keys":28}],50:[function(require,module,exports){
var $def     = require('./$.def')
  , replacer = require('./$.replacer');
var escapeHTMLDict = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;'
}, unescapeHTMLDict = {}, key;
for(key in escapeHTMLDict)unescapeHTMLDict[escapeHTMLDict[key]] = key;
$def($def.P + $def.F, 'String', {
  escapeHTML:   replacer(/[&<>"']/g, escapeHTMLDict),
  unescapeHTML: replacer(/&(?:amp|lt|gt|quot|apos);/g, unescapeHTMLDict)
});
},{"./$.def":22,"./$.replacer":30}],51:[function(require,module,exports){
var $                = require('./$')
  , cof              = require('./$.cof')
  , $def             = require('./$.def')
  , invoke           = require('./$.invoke')
  , arrayMethod      = require('./$.array-methods')
  , IE_PROTO         = require('./$.uid').safe('__proto__')
  , assert           = require('./$.assert')
  , assertObject     = assert.obj
  , ObjectProto      = Object.prototype
  , A                = []
  , slice            = A.slice
  , indexOf          = A.indexOf
  , classof          = cof.classof
  , defineProperties = Object.defineProperties
  , has              = $.has
  , defineProperty   = $.setDesc
  , getOwnDescriptor = $.getDesc
  , isFunction       = $.isFunction
  , toObject         = $.toObject
  , toLength         = $.toLength
  , IE8_DOM_DEFINE   = false;

if(!$.DESC){
  try {
    IE8_DOM_DEFINE = defineProperty(document.createElement('div'), 'x',
      {get: function(){ return 8; }}
    ).x == 8;
  } catch(e){ /* empty */ }
  $.setDesc = function(O, P, Attributes){
    if(IE8_DOM_DEFINE)try {
      return defineProperty(O, P, Attributes);
    } catch(e){ /* empty */ }
    if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
    if('value' in Attributes)assertObject(O)[P] = Attributes.value;
    return O;
  };
  $.getDesc = function(O, P){
    if(IE8_DOM_DEFINE)try {
      return getOwnDescriptor(O, P);
    } catch(e){ /* empty */ }
    if(has(O, P))return $.desc(!ObjectProto.propertyIsEnumerable.call(O, P), O[P]);
  };
  defineProperties = function(O, Properties){
    assertObject(O);
    var keys   = $.getKeys(Properties)
      , length = keys.length
      , i = 0
      , P;
    while(length > i)$.setDesc(O, P = keys[i++], Properties[P]);
    return O;
  };
}
$def($def.S + $def.F * !$.DESC, 'Object', {
  // 19.1.2.6 / 15.2.3.3 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $.getDesc,
  // 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
  defineProperty: $.setDesc,
  // 19.1.2.3 / 15.2.3.7 Object.defineProperties(O, Properties)
  defineProperties: defineProperties
});

  // IE 8- don't enum bug keys
var keys1 = ('constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,' +
            'toLocaleString,toString,valueOf').split(',')
  // Additional keys for getOwnPropertyNames
  , keys2 = keys1.concat('length', 'prototype')
  , keysLen1 = keys1.length;

// Create object with `null` prototype: use iframe Object with cleared prototype
var createDict = function(){
  // Thrash, waste and sodomy: IE GC bug
  var iframe = document.createElement('iframe')
    , i      = keysLen1
    , iframeDocument;
  iframe.style.display = 'none';
  $.html.appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write('<script>document.F=Object</script>');
  iframeDocument.close();
  createDict = iframeDocument.F;
  while(i--)delete createDict.prototype[keys1[i]];
  return createDict();
};
function createGetKeys(names, length){
  return function(object){
    var O      = toObject(object)
      , i      = 0
      , result = []
      , key;
    for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
    // Don't enum bug & hidden keys
    while(length > i)if(has(O, key = names[i++])){
      ~indexOf.call(result, key) || result.push(key);
    }
    return result;
  };
}
function isPrimitive(it){ return !$.isObject(it); }
function Empty(){}
$def($def.S, 'Object', {
  // 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
  getPrototypeOf: $.getProto = $.getProto || function(O){
    O = Object(assert.def(O));
    if(has(O, IE_PROTO))return O[IE_PROTO];
    if(isFunction(O.constructor) && O instanceof O.constructor){
      return O.constructor.prototype;
    } return O instanceof Object ? ObjectProto : null;
  },
  // 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $.getNames = $.getNames || createGetKeys(keys2, keys2.length, true),
  // 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
  create: $.create = $.create || function(O, /*?*/Properties){
    var result;
    if(O !== null){
      Empty.prototype = assertObject(O);
      result = new Empty();
      Empty.prototype = null;
      // add "__proto__" for Object.getPrototypeOf shim
      result[IE_PROTO] = O;
    } else result = createDict();
    return Properties === undefined ? result : defineProperties(result, Properties);
  },
  // 19.1.2.14 / 15.2.3.14 Object.keys(O)
  keys: $.getKeys = $.getKeys || createGetKeys(keys1, keysLen1, false),
  // 19.1.2.17 / 15.2.3.8 Object.seal(O)
  seal: $.it, // <- cap
  // 19.1.2.5 / 15.2.3.9 Object.freeze(O)
  freeze: $.it, // <- cap
  // 19.1.2.15 / 15.2.3.10 Object.preventExtensions(O)
  preventExtensions: $.it, // <- cap
  // 19.1.2.13 / 15.2.3.11 Object.isSealed(O)
  isSealed: isPrimitive, // <- cap
  // 19.1.2.12 / 15.2.3.12 Object.isFrozen(O)
  isFrozen: isPrimitive, // <- cap
  // 19.1.2.11 / 15.2.3.13 Object.isExtensible(O)
  isExtensible: $.isObject // <- cap
});

// 19.2.3.2 / 15.3.4.5 Function.prototype.bind(thisArg, args...)
$def($def.P, 'Function', {
  bind: function(that /*, args... */){
    var fn       = assert.fn(this)
      , partArgs = slice.call(arguments, 1);
    function bound(/* args... */){
      var args = partArgs.concat(slice.call(arguments));
      return invoke(fn, args, this instanceof bound ? $.create(fn.prototype) : that);
    }
    if(fn.prototype)bound.prototype = fn.prototype;
    return bound;
  }
});

// Fix for not array-like ES3 string
function arrayMethodFix(fn){
  return function(){
    return fn.apply($.ES5Object(this), arguments);
  };
}
if(!(0 in Object('z') && 'z'[0] == 'z')){
  $.ES5Object = function(it){
    return cof(it) == 'String' ? it.split('') : Object(it);
  };
}
$def($def.P + $def.F * ($.ES5Object != Object), 'Array', {
  slice: arrayMethodFix(slice),
  join: arrayMethodFix(A.join)
});

// 22.1.2.2 / 15.4.3.2 Array.isArray(arg)
$def($def.S, 'Array', {
  isArray: function(arg){
    return cof(arg) == 'Array';
  }
});
function createArrayReduce(isRight){
  return function(callbackfn, memo){
    assert.fn(callbackfn);
    var O      = toObject(this)
      , length = toLength(O.length)
      , index  = isRight ? length - 1 : 0
      , i      = isRight ? -1 : 1;
    if(arguments.length < 2)for(;;){
      if(index in O){
        memo = O[index];
        index += i;
        break;
      }
      index += i;
      assert(isRight ? index >= 0 : length > index, 'Reduce of empty array with no initial value');
    }
    for(;isRight ? index >= 0 : length > index; index += i)if(index in O){
      memo = callbackfn(memo, O[index], index, this);
    }
    return memo;
  };
}
$def($def.P, 'Array', {
  // 22.1.3.10 / 15.4.4.18 Array.prototype.forEach(callbackfn [, thisArg])
  forEach: $.each = $.each || arrayMethod(0),
  // 22.1.3.15 / 15.4.4.19 Array.prototype.map(callbackfn [, thisArg])
  map: arrayMethod(1),
  // 22.1.3.7 / 15.4.4.20 Array.prototype.filter(callbackfn [, thisArg])
  filter: arrayMethod(2),
  // 22.1.3.23 / 15.4.4.17 Array.prototype.some(callbackfn [, thisArg])
  some: arrayMethod(3),
  // 22.1.3.5 / 15.4.4.16 Array.prototype.every(callbackfn [, thisArg])
  every: arrayMethod(4),
  // 22.1.3.18 / 15.4.4.21 Array.prototype.reduce(callbackfn [, initialValue])
  reduce: createArrayReduce(false),
  // 22.1.3.19 / 15.4.4.22 Array.prototype.reduceRight(callbackfn [, initialValue])
  reduceRight: createArrayReduce(true),
  // 22.1.3.11 / 15.4.4.14 Array.prototype.indexOf(searchElement [, fromIndex])
  indexOf: indexOf = indexOf || require('./$.array-includes')(false),
  // 22.1.3.14 / 15.4.4.15 Array.prototype.lastIndexOf(searchElement [, fromIndex])
  lastIndexOf: function(el, fromIndex /* = @[*-1] */){
    var O      = toObject(this)
      , length = toLength(O.length)
      , index  = length - 1;
    if(arguments.length > 1)index = Math.min(index, $.toInteger(fromIndex));
    if(index < 0)index = toLength(length + index);
    for(;index >= 0; index--)if(index in O)if(O[index] === el)return index;
    return -1;
  }
});

// 21.1.3.25 / 15.5.4.20 String.prototype.trim()
$def($def.P, 'String', {trim: require('./$.replacer')(/^\s*([\s\S]*\S)?\s*$/, '$1')});

// 20.3.3.1 / 15.9.4.4 Date.now()
$def($def.S, 'Date', {now: function(){
  return +new Date;
}});

function lz(num){
  return num > 9 ? num : '0' + num;
}
// 20.3.4.36 / 15.9.5.43 Date.prototype.toISOString()
$def($def.P, 'Date', {toISOString: function(){
  if(!isFinite(this))throw RangeError('Invalid time value');
  var d = this
    , y = d.getUTCFullYear()
    , m = d.getUTCMilliseconds()
    , s = y < 0 ? '-' : y > 9999 ? '+' : '';
  return s + ('00000' + Math.abs(y)).slice(s ? -6 : -4) +
    '-' + lz(d.getUTCMonth() + 1) + '-' + lz(d.getUTCDate()) +
    'T' + lz(d.getUTCHours()) + ':' + lz(d.getUTCMinutes()) +
    ':' + lz(d.getUTCSeconds()) + '.' + (m > 99 ? m : '0' + lz(m)) + 'Z';
}});

if(classof(function(){ return arguments; }()) == 'Object')cof.classof = function(it){
  var tag = classof(it);
  return tag == 'Object' && isFunction(it.callee) ? 'Arguments' : tag;
};
},{"./$":26,"./$.array-includes":13,"./$.array-methods":14,"./$.assert":15,"./$.cof":17,"./$.def":22,"./$.invoke":24,"./$.replacer":30,"./$.uid":35}],52:[function(require,module,exports){
'use strict';
var $       = require('./$')
  , $def    = require('./$.def')
  , toIndex = $.toIndex;
$def($def.P, 'Array', {
  // 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
  copyWithin: function(target/* = 0 */, start /* = 0, end = @length */){
    var O     = Object($.assertDefined(this))
      , len   = $.toLength(O.length)
      , to    = toIndex(target, len)
      , from  = toIndex(start, len)
      , end   = arguments[2]
      , fin   = end === undefined ? len : toIndex(end, len)
      , count = Math.min(fin - from, len - to)
      , inc   = 1;
    if(from < to && to < from + count){
      inc  = -1;
      from = from + count - 1;
      to   = to   + count - 1;
    }
    while(count-- > 0){
      if(from in O)O[to] = O[from];
      else delete O[to];
      to   += inc;
      from += inc;
    } return O;
  }
});
require('./$.unscope')('copyWithin');
},{"./$":26,"./$.def":22,"./$.unscope":36}],53:[function(require,module,exports){
'use strict';
var $       = require('./$')
  , $def    = require('./$.def')
  , toIndex = $.toIndex;
$def($def.P, 'Array', {
  // 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
  fill: function(value /*, start = 0, end = @length */){
    var O      = Object($.assertDefined(this))
      , length = $.toLength(O.length)
      , index  = toIndex(arguments[1], length)
      , end    = arguments[2]
      , endPos = end === undefined ? length : toIndex(end, length);
    while(endPos > index)O[index++] = value;
    return O;
  }
});
require('./$.unscope')('fill');
},{"./$":26,"./$.def":22,"./$.unscope":36}],54:[function(require,module,exports){
var $def = require('./$.def');
$def($def.P, 'Array', {
  // 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)
  findIndex: require('./$.array-methods')(6)
});
require('./$.unscope')('findIndex');
},{"./$.array-methods":14,"./$.def":22,"./$.unscope":36}],55:[function(require,module,exports){
var $def = require('./$.def');
$def($def.P, 'Array', {
  // 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)
  find: require('./$.array-methods')(5)
});
require('./$.unscope')('find');
},{"./$.array-methods":14,"./$.def":22,"./$.unscope":36}],56:[function(require,module,exports){
var $     = require('./$')
  , ctx   = require('./$.ctx')
  , $def  = require('./$.def')
  , $iter = require('./$.iter')
  , stepCall = $iter.stepCall;
$def($def.S + $def.F * $iter.DANGER_CLOSING, 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function(arrayLike/*, mapfn = undefined, thisArg = undefined*/){
    var O       = Object($.assertDefined(arrayLike))
      , mapfn   = arguments[1]
      , mapping = mapfn !== undefined
      , f       = mapping ? ctx(mapfn, arguments[2], 2) : undefined
      , index   = 0
      , length, result, step, iterator;
    if($iter.is(O)){
      iterator = $iter.get(O);
      // strange IE quirks mode bug -> use typeof instead of isFunction
      result   = new (typeof this == 'function' ? this : Array);
      for(; !(step = iterator.next()).done; index++){
        result[index] = mapping ? stepCall(iterator, f, [step.value, index], true) : step.value;
      }
    } else {
      // strange IE quirks mode bug -> use typeof instead of isFunction
      result = new (typeof this == 'function' ? this : Array)(length = $.toLength(O.length));
      for(; length > index; index++){
        result[index] = mapping ? f(O[index], index) : O[index];
      }
    }
    result.length = index;
    return result;
  }
});
},{"./$":26,"./$.ctx":21,"./$.def":22,"./$.iter":25}],57:[function(require,module,exports){
var $          = require('./$')
  , setUnscope = require('./$.unscope')
  , ITER       = require('./$.uid').safe('iter')
  , $iter      = require('./$.iter')
  , step       = $iter.step
  , Iterators  = $iter.Iterators;

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
$iter.std(Array, 'Array', function(iterated, kind){
  $.set(this, ITER, {o: $.toObject(iterated), i: 0, k: kind});
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function(){
  var iter  = this[ITER]
    , O     = iter.o
    , kind  = iter.k
    , index = iter.i++;
  if(!O || index >= O.length){
    iter.o = undefined;
    return step(1);
  }
  if(kind == 'key'  )return step(0, index);
  if(kind == 'value')return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'value');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

setUnscope('keys');
setUnscope('values');
setUnscope('entries');
},{"./$":26,"./$.iter":25,"./$.uid":35,"./$.unscope":36}],58:[function(require,module,exports){
var $def = require('./$.def');
$def($def.S, 'Array', {
  // 22.1.2.3 Array.of( ...items)
  of: function(/* ...args */){
    var index  = 0
      , length = arguments.length
      // strange IE quirks mode bug -> use typeof instead of isFunction
      , result = new (typeof this == 'function' ? this : Array)(length);
    while(length > index)result[index] = arguments[index++];
    result.length = length;
    return result;
  }
});
},{"./$.def":22}],59:[function(require,module,exports){
require('./$.species')(Array);
},{"./$.species":32}],60:[function(require,module,exports){
'use strict';
var $    = require('./$')
  , NAME = 'name'
  , setDesc = $.setDesc
  , FunctionProto = Function.prototype;
// 19.2.4.2 name
NAME in FunctionProto || $.FW && $.DESC && setDesc(FunctionProto, NAME, {
  configurable: true,
  get: function(){
    var match = String(this).match(/^\s*function ([^ (]*)/)
      , name  = match ? match[1] : '';
    $.has(this, NAME) || setDesc(this, NAME, $.desc(5, name));
    return name;
  },
  set: function(value){
    $.has(this, NAME) || setDesc(this, NAME, $.desc(0, value));
  }
});
},{"./$":26}],61:[function(require,module,exports){
'use strict';
var strong = require('./$.collection-strong');

// 23.1 Map Objects
require('./$.collection')('Map', {
  // 23.1.3.6 Map.prototype.get(key)
  get: function(key){
    var entry = strong.getEntry(this, key);
    return entry && entry.v;
  },
  // 23.1.3.9 Map.prototype.set(key, value)
  set: function(key, value){
    return strong.def(this, key === 0 ? 0 : key, value);
  }
}, strong, true);
},{"./$.collection":20,"./$.collection-strong":18}],62:[function(require,module,exports){
var Infinity = 1 / 0
  , $def  = require('./$.def')
  , E     = Math.E
  , pow   = Math.pow
  , abs   = Math.abs
  , exp   = Math.exp
  , log   = Math.log
  , sqrt  = Math.sqrt
  , ceil  = Math.ceil
  , floor = Math.floor
  , sign  = Math.sign || function(x){
      return (x = +x) == 0 || x != x ? x : x < 0 ? -1 : 1;
    };

// 20.2.2.5 Math.asinh(x)
function asinh(x){
  return !isFinite(x = +x) || x == 0 ? x : x < 0 ? -asinh(-x) : log(x + sqrt(x * x + 1));
}
// 20.2.2.14 Math.expm1(x)
function expm1(x){
  return (x = +x) == 0 ? x : x > -1e-6 && x < 1e-6 ? x + x * x / 2 : exp(x) - 1;
}

$def($def.S, 'Math', {
  // 20.2.2.3 Math.acosh(x)
  acosh: function(x){
    return (x = +x) < 1 ? NaN : isFinite(x) ? log(x / E + sqrt(x + 1) * sqrt(x - 1) / E) + 1 : x;
  },
  // 20.2.2.5 Math.asinh(x)
  asinh: asinh,
  // 20.2.2.7 Math.atanh(x)
  atanh: function(x){
    return (x = +x) == 0 ? x : log((1 + x) / (1 - x)) / 2;
  },
  // 20.2.2.9 Math.cbrt(x)
  cbrt: function(x){
    return sign(x = +x) * pow(abs(x), 1 / 3);
  },
  // 20.2.2.11 Math.clz32(x)
  clz32: function(x){
    return (x >>>= 0) ? 32 - x.toString(2).length : 32;
  },
  // 20.2.2.12 Math.cosh(x)
  cosh: function(x){
    return (exp(x = +x) + exp(-x)) / 2;
  },
  // 20.2.2.14 Math.expm1(x)
  expm1: expm1,
  // 20.2.2.16 Math.fround(x)
  // TODO: fallback for IE9-
  fround: function(x){
    return new Float32Array([x])[0];
  },
  // 20.2.2.17 Math.hypot([value1[, value2[, … ]]])
  hypot: function(value1, value2){ // eslint-disable-line no-unused-vars
    var sum  = 0
      , len1 = arguments.length
      , len2 = len1
      , args = Array(len1)
      , larg = -Infinity
      , arg;
    while(len1--){
      arg = args[len1] = +arguments[len1];
      if(arg == Infinity || arg == -Infinity)return Infinity;
      if(arg > larg)larg = arg;
    }
    larg = arg || 1;
    while(len2--)sum += pow(args[len2] / larg, 2);
    return larg * sqrt(sum);
  },
  // 20.2.2.18 Math.imul(x, y)
  imul: function(x, y){
    var UInt16 = 0xffff
      , xn = +x
      , yn = +y
      , xl = UInt16 & xn
      , yl = UInt16 & yn;
    return 0 | xl * yl + ((UInt16 & xn >>> 16) * yl + xl * (UInt16 & yn >>> 16) << 16 >>> 0);
  },
  // 20.2.2.20 Math.log1p(x)
  log1p: function(x){
    return (x = +x) > -1e-8 && x < 1e-8 ? x - x * x / 2 : log(1 + x);
  },
  // 20.2.2.21 Math.log10(x)
  log10: function(x){
    return log(x) / Math.LN10;
  },
  // 20.2.2.22 Math.log2(x)
  log2: function(x){
    return log(x) / Math.LN2;
  },
  // 20.2.2.28 Math.sign(x)
  sign: sign,
  // 20.2.2.30 Math.sinh(x)
  sinh: function(x){
    return abs(x = +x) < 1 ? (expm1(x) - expm1(-x)) / 2 : (exp(x - 1) - exp(-x - 1)) * (E / 2);
  },
  // 20.2.2.33 Math.tanh(x)
  tanh: function(x){
    var a = expm1(x = +x)
      , b = expm1(-x);
    return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (exp(x) + exp(-x));
  },
  // 20.2.2.34 Math.trunc(x)
  trunc: function(it){
    return (it > 0 ? floor : ceil)(it);
  }
});
},{"./$.def":22}],63:[function(require,module,exports){
'use strict';
var $          = require('./$')
  , isObject   = $.isObject
  , isFunction = $.isFunction
  , NUMBER     = 'Number'
  , Number     = $.g[NUMBER]
  , Base       = Number
  , proto      = Number.prototype;
function toPrimitive(it){
  var fn, val;
  if(isFunction(fn = it.valueOf) && !isObject(val = fn.call(it)))return val;
  if(isFunction(fn = it.toString) && !isObject(val = fn.call(it)))return val;
  throw TypeError("Can't convert object to number");
}
function toNumber(it){
  if(isObject(it))it = toPrimitive(it);
  if(typeof it == 'string' && it.length > 2 && it.charCodeAt(0) == 48){
    var binary = false;
    switch(it.charCodeAt(1)){
      case 66 : case 98  : binary = true;
      case 79 : case 111 : return parseInt(it.slice(2), binary ? 2 : 8);
    }
  } return +it;
}
if($.FW && !(Number('0o1') && Number('0b1'))){
  Number = function Number(it){
    return this instanceof Number ? new Base(toNumber(it)) : toNumber(it);
  };
  $.each.call($.DESC ? $.getNames(Base) : (
      // ES3:
      'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
      // ES6 (in case, if modules with ES6 Number statics required before):
      'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,' +
      'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger'
    ).split(','), function(key){
      if($.has(Base, key) && !$.has(Number, key)){
        $.setDesc(Number, key, $.getDesc(Base, key));
      }
    }
  );
  Number.prototype = proto;
  proto.constructor = Number;
  $.hide($.g, NUMBER, Number);
}
},{"./$":26}],64:[function(require,module,exports){
var $     = require('./$')
  , $def  = require('./$.def')
  , abs   = Math.abs
  , floor = Math.floor
  , MAX_SAFE_INTEGER = 0x1fffffffffffff; // pow(2, 53) - 1 == 9007199254740991;
function isInteger(it){
  return !$.isObject(it) && isFinite(it) && floor(it) === it;
}
$def($def.S, 'Number', {
  // 20.1.2.1 Number.EPSILON
  EPSILON: Math.pow(2, -52),
  // 20.1.2.2 Number.isFinite(number)
  isFinite: function(it){
    return typeof it == 'number' && isFinite(it);
  },
  // 20.1.2.3 Number.isInteger(number)
  isInteger: isInteger,
  // 20.1.2.4 Number.isNaN(number)
  isNaN: function(number){
    return number != number;
  },
  // 20.1.2.5 Number.isSafeInteger(number)
  isSafeInteger: function(number){
    return isInteger(number) && abs(number) <= MAX_SAFE_INTEGER;
  },
  // 20.1.2.6 Number.MAX_SAFE_INTEGER
  MAX_SAFE_INTEGER: MAX_SAFE_INTEGER,
  // 20.1.2.10 Number.MIN_SAFE_INTEGER
  MIN_SAFE_INTEGER: -MAX_SAFE_INTEGER,
  // 20.1.2.12 Number.parseFloat(string)
  parseFloat: parseFloat,
  // 20.1.2.13 Number.parseInt(string, radix)
  parseInt: parseInt
});
},{"./$":26,"./$.def":22}],65:[function(require,module,exports){
// 19.1.3.1 Object.assign(target, source)
var $def = require('./$.def');
$def($def.S, 'Object', {assign: require('./$.assign')});
},{"./$.assign":16,"./$.def":22}],66:[function(require,module,exports){
// 19.1.3.10 Object.is(value1, value2)
var $def = require('./$.def');
$def($def.S, 'Object', {
  is: function(x, y){
    return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
  }
});
},{"./$.def":22}],67:[function(require,module,exports){
// 19.1.3.19 Object.setPrototypeOf(O, proto)
var $def = require('./$.def');
$def($def.S, 'Object', {setPrototypeOf: require('./$.set-proto')});
},{"./$.def":22,"./$.set-proto":31}],68:[function(require,module,exports){
var $        = require('./$')
  , $def     = require('./$.def')
  , isObject = $.isObject
  , toObject = $.toObject;
function wrapObjectMethod(METHOD, MODE){
  var fn  = ($.core.Object || {})[METHOD] || Object[METHOD]
    , f   = 0
    , o   = {};
  o[METHOD] = MODE == 1 ? function(it){
    return isObject(it) ? fn(it) : it;
  } : MODE == 2 ? function(it){
    return isObject(it) ? fn(it) : true;
  } : MODE == 3 ? function(it){
    return isObject(it) ? fn(it) : false;
  } : MODE == 4 ? function(it, key){
    return fn(toObject(it), key);
  } : MODE == 5 ? function(it){
    return fn(Object($.assertDefined(it)));
  } : function(it){
    return fn(toObject(it));
  };
  try {
    fn('z');
  } catch(e){
    f = 1;
  }
  $def($def.S + $def.F * f, 'Object', o);
}
wrapObjectMethod('freeze', 1);
wrapObjectMethod('seal', 1);
wrapObjectMethod('preventExtensions', 1);
wrapObjectMethod('isFrozen', 2);
wrapObjectMethod('isSealed', 2);
wrapObjectMethod('isExtensible', 3);
wrapObjectMethod('getOwnPropertyDescriptor', 4);
wrapObjectMethod('getPrototypeOf', 5);
wrapObjectMethod('keys');
wrapObjectMethod('getOwnPropertyNames');
},{"./$":26,"./$.def":22}],69:[function(require,module,exports){
'use strict';
// 19.1.3.6 Object.prototype.toString()
var $   = require('./$')
  , cof = require('./$.cof')
  , tmp = {};
tmp[require('./$.wks')('toStringTag')] = 'z';
if($.FW && cof(tmp) != 'z')$.hide(Object.prototype, 'toString', function(){
  return '[object ' + cof.classof(this) + ']';
});
},{"./$":26,"./$.cof":17,"./$.wks":37}],70:[function(require,module,exports){
'use strict';
var $       = require('./$')
  , ctx     = require('./$.ctx')
  , cof     = require('./$.cof')
  , $def    = require('./$.def')
  , assert  = require('./$.assert')
  , $iter   = require('./$.iter')
  , SPECIES = require('./$.wks')('species')
  , RECORD  = require('./$.uid').safe('record')
  , forOf   = $iter.forOf
  , PROMISE = 'Promise'
  , global  = $.g
  , process = global.process
  , asap    = process && process.nextTick || require('./$.task').set
  , Promise = global[PROMISE]
  , Base    = Promise
  , isFunction     = $.isFunction
  , isObject       = $.isObject
  , assertFunction = assert.fn
  , assertObject   = assert.obj
  , test;
function getConstructor(C){
  var S = assertObject(C)[SPECIES];
  return S != undefined ? S : C;
}
isFunction(Promise) && isFunction(Promise.resolve)
&& Promise.resolve(test = new Promise(function(){})) == test
|| function(){
  function isThenable(it){
    var then;
    if(isObject(it))then = it.then;
    return isFunction(then) ? then : false;
  }
  function handledRejectionOrHasOnRejected(promise){
    var record = promise[RECORD]
      , chain  = record.c
      , i      = 0
      , react;
    if(record.h)return true;
    while(chain.length > i){
      react = chain[i++];
      if(react.fail || handledRejectionOrHasOnRejected(react.P))return true;
    }
  }
  function notify(record, isReject){
    var chain = record.c;
    if(isReject || chain.length)asap(function(){
      var promise = record.p
        , value   = record.v
        , ok      = record.s == 1
        , i       = 0;
      if(isReject && !handledRejectionOrHasOnRejected(promise)){
        setTimeout(function(){
          if(!handledRejectionOrHasOnRejected(promise)){
            if(cof(process) == 'process'){
              process.emit('unhandledRejection', value, promise);
            } else if(global.console && isFunction(console.error)){
              console.error('Unhandled promise rejection', value);
            }
          }
        }, 1e3);
      } else while(chain.length > i)!function(react){
        var cb = ok ? react.ok : react.fail
          , ret, then;
        try {
          if(cb){
            if(!ok)record.h = true;
            ret = cb === true ? value : cb(value);
            if(ret === react.P){
              react.rej(TypeError(PROMISE + '-chain cycle'));
            } else if(then = isThenable(ret)){
              then.call(ret, react.res, react.rej);
            } else react.res(ret);
          } else react.rej(value);
        } catch(err){
          react.rej(err);
        }
      }(chain[i++]);
      chain.length = 0;
    });
  }
  function reject(value){
    var record = this;
    if(record.d)return;
    record.d = true;
    record = record.r || record; // unwrap
    record.v = value;
    record.s = 2;
    notify(record, true);
  }
  function resolve(value){
    var record = this
      , then, wrapper;
    if(record.d)return;
    record.d = true;
    record = record.r || record; // unwrap
    try {
      if(then = isThenable(value)){
        wrapper = {r: record, d: false}; // wrap
        then.call(value, ctx(resolve, wrapper, 1), ctx(reject, wrapper, 1));
      } else {
        record.v = value;
        record.s = 1;
        notify(record);
      }
    } catch(err){
      reject.call(wrapper || {r: record, d: false}, err); // wrap
    }
  }
  // 25.4.3.1 Promise(executor)
  Promise = function(executor){
    assertFunction(executor);
    var record = {
      p: assert.inst(this, Promise, PROMISE), // <- promise
      c: [],                                  // <- chain
      s: 0,                                   // <- state
      d: false,                               // <- done
      v: undefined,                           // <- value
      h: false                                // <- handled rejection
    };
    $.hide(this, RECORD, record);
    try {
      executor(ctx(resolve, record, 1), ctx(reject, record, 1));
    } catch(err){
      reject.call(record, err);
    }
  };
  $.mix(Promise.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function(onFulfilled, onRejected){
      var S = assertObject(assertObject(this).constructor)[SPECIES];
      var react = {
        ok:   isFunction(onFulfilled) ? onFulfilled : true,
        fail: isFunction(onRejected)  ? onRejected  : false
      };
      var P = react.P = new (S != undefined ? S : Promise)(function(res, rej){
        react.res = assertFunction(res);
        react.rej = assertFunction(rej);
      });
      var record = this[RECORD];
      record.c.push(react);
      record.s && notify(record);
      return P;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function(onRejected){
      return this.then(undefined, onRejected);
    }
  });
}();
$def($def.G + $def.W + $def.F * (Promise != Base), {Promise: Promise});
$def($def.S, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function(r){
    return new (getConstructor(this))(function(res, rej){
      rej(r);
    });
  },
  // 25.4.4.6 Promise.resolve(x)
  resolve: function(x){
    return isObject(x) && RECORD in x && $.getProto(x) === this.prototype
      ? x : new (getConstructor(this))(function(res){
        res(x);
      });
  }
});
$def($def.S + $def.F * ($iter.fail(function(iter){
  Promise.all(iter)['catch'](function(){});
}) || $iter.DANGER_CLOSING), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function(iterable){
    var C      = getConstructor(this)
      , values = [];
    return new C(function(resolve, reject){
      forOf(iterable, false, values.push, values);
      var remaining = values.length
        , results   = Array(remaining);
      if(remaining)$.each.call(values, function(promise, index){
        C.resolve(promise).then(function(value){
          results[index] = value;
          --remaining || resolve(results);
        }, reject);
      });
      else resolve(results);
    });
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function(iterable){
    var C = getConstructor(this);
    return new C(function(resolve, reject){
      forOf(iterable, false, function(promise){
        C.resolve(promise).then(resolve, reject);
      });
    });
  }
});
cof.set(Promise, PROMISE);
require('./$.species')(Promise);
},{"./$":26,"./$.assert":15,"./$.cof":17,"./$.ctx":21,"./$.def":22,"./$.iter":25,"./$.species":32,"./$.task":34,"./$.uid":35,"./$.wks":37}],71:[function(require,module,exports){
var $         = require('./$')
  , $def      = require('./$.def')
  , setProto  = require('./$.set-proto')
  , $iter     = require('./$.iter')
  , ITER      = require('./$.uid').safe('iter')
  , step      = $iter.step
  , assert    = require('./$.assert')
  , isObject  = $.isObject
  , getDesc   = $.getDesc
  , setDesc   = $.setDesc
  , getProto  = $.getProto
  , apply     = Function.apply
  , assertObject = assert.obj
  , isExtensible = Object.isExtensible || $.it;
function Enumerate(iterated){
  var keys = [], key;
  for(key in iterated)keys.push(key);
  $.set(this, ITER, {o: iterated, a: keys, i: 0});
}
$iter.create(Enumerate, 'Object', function(){
  var iter = this[ITER]
    , keys = iter.a
    , key;
  do {
    if(iter.i >= keys.length)return step(1);
  } while(!((key = keys[iter.i++]) in iter.o));
  return step(0, key);
});

function wrap(fn){
  return function(it){
    assertObject(it);
    try {
      fn.apply(undefined, arguments);
      return true;
    } catch(e){
      return false;
    }
  };
}

function reflectGet(target, propertyKey/*, receiver*/){
  var receiver = arguments.length < 3 ? target : arguments[2]
    , desc = getDesc(assertObject(target), propertyKey), proto;
  if(desc)return $.has(desc, 'value')
    ? desc.value
    : desc.get === undefined
      ? undefined
      : desc.get.call(receiver);
  return isObject(proto = getProto(target))
    ? reflectGet(proto, propertyKey, receiver)
    : undefined;
}
function reflectSet(target, propertyKey, V/*, receiver*/){
  var receiver = arguments.length < 4 ? target : arguments[3]
    , ownDesc  = getDesc(assertObject(target), propertyKey)
    , existingDescriptor, proto;
  if(!ownDesc){
    if(isObject(proto = getProto(target))){
      return reflectSet(proto, propertyKey, V, receiver);
    }
    ownDesc = $.desc(0);
  }
  if($.has(ownDesc, 'value')){
    if(ownDesc.writable === false || !isObject(receiver))return false;
    existingDescriptor = getDesc(receiver, propertyKey) || $.desc(0);
    existingDescriptor.value = V;
    setDesc(receiver, propertyKey, existingDescriptor);
    return true;
  }
  return ownDesc.set === undefined ? false : (ownDesc.set.call(receiver, V), true);
}

var reflect = {
  // 26.1.1 Reflect.apply(target, thisArgument, argumentsList)
  apply: require('./$.ctx')(Function.call, apply, 3),
  // 26.1.2 Reflect.construct(target, argumentsList [, newTarget])
  construct: function(target, argumentsList /*, newTarget*/){
    var proto    = assert.fn(arguments.length < 3 ? target : arguments[2]).prototype
      , instance = $.create(isObject(proto) ? proto : Object.prototype)
      , result   = apply.call(target, instance, argumentsList);
    return isObject(result) ? result : instance;
  },
  // 26.1.3 Reflect.defineProperty(target, propertyKey, attributes)
  defineProperty: wrap(setDesc),
  // 26.1.4 Reflect.deleteProperty(target, propertyKey)
  deleteProperty: function(target, propertyKey){
    var desc = getDesc(assertObject(target), propertyKey);
    return desc && !desc.configurable ? false : delete target[propertyKey];
  },
  // 26.1.5 Reflect.enumerate(target)
  enumerate: function(target){
    return new Enumerate(assertObject(target));
  },
  // 26.1.6 Reflect.get(target, propertyKey [, receiver])
  get: reflectGet,
  // 26.1.7 Reflect.getOwnPropertyDescriptor(target, propertyKey)
  getOwnPropertyDescriptor: function(target, propertyKey){
    return getDesc(assertObject(target), propertyKey);
  },
  // 26.1.8 Reflect.getPrototypeOf(target)
  getPrototypeOf: function(target){
    return getProto(assertObject(target));
  },
  // 26.1.9 Reflect.has(target, propertyKey)
  has: function(target, propertyKey){
    return propertyKey in target;
  },
  // 26.1.10 Reflect.isExtensible(target)
  isExtensible: function(target){
    return !!isExtensible(assertObject(target));
  },
  // 26.1.11 Reflect.ownKeys(target)
  ownKeys: require('./$.own-keys'),
  // 26.1.12 Reflect.preventExtensions(target)
  preventExtensions: wrap(Object.preventExtensions || $.it),
  // 26.1.13 Reflect.set(target, propertyKey, V [, receiver])
  set: reflectSet
};
// 26.1.14 Reflect.setPrototypeOf(target, proto)
if(setProto)reflect.setPrototypeOf = function(target, proto){
  setProto(assertObject(target), proto);
  return true;
};

$def($def.G, {Reflect: {}});
$def($def.S, 'Reflect', reflect);
},{"./$":26,"./$.assert":15,"./$.ctx":21,"./$.def":22,"./$.iter":25,"./$.own-keys":28,"./$.set-proto":31,"./$.uid":35}],72:[function(require,module,exports){
var $      = require('./$')
  , cof    = require('./$.cof')
  , RegExp = $.g.RegExp
  , Base   = RegExp
  , proto  = RegExp.prototype;
if($.FW && $.DESC){
  // RegExp allows a regex with flags as the pattern
  if(!function(){try{ return RegExp(/a/g, 'i') == '/a/i'; }catch(e){ /* empty */ }}()){
    RegExp = function RegExp(pattern, flags){
      return new Base(cof(pattern) == 'RegExp' && flags !== undefined
        ? pattern.source : pattern, flags);
    };
    $.each.call($.getNames(Base), function(key){
      key in RegExp || $.setDesc(RegExp, key, {
        configurable: true,
        get: function(){ return Base[key]; },
        set: function(it){ Base[key] = it; }
      });
    });
    proto.constructor = RegExp;
    RegExp.prototype = proto;
    $.hide($.g, 'RegExp', RegExp);
  }
  // 21.2.5.3 get RegExp.prototype.flags()
  if(/./g.flags != 'g')$.setDesc(proto, 'flags', {
    configurable: true,
    get: require('./$.replacer')(/^.*\/(\w*)$/, '$1')
  });
}
require('./$.species')(RegExp);
},{"./$":26,"./$.cof":17,"./$.replacer":30,"./$.species":32}],73:[function(require,module,exports){
'use strict';
var strong = require('./$.collection-strong');

// 23.2 Set Objects
require('./$.collection')('Set', {
  // 23.2.3.1 Set.prototype.add(value)
  add: function(value){
    return strong.def(this, value = value === 0 ? 0 : value, value);
  }
}, strong);
},{"./$.collection":20,"./$.collection-strong":18}],74:[function(require,module,exports){
var $def = require('./$.def');
$def($def.P, 'String', {
  // 21.1.3.3 String.prototype.codePointAt(pos)
  codePointAt: require('./$.string-at')(false)
});
},{"./$.def":22,"./$.string-at":33}],75:[function(require,module,exports){
'use strict';
var $    = require('./$')
  , cof  = require('./$.cof')
  , $def = require('./$.def')
  , toLength = $.toLength;

$def($def.P, 'String', {
  // 21.1.3.6 String.prototype.endsWith(searchString [, endPosition])
  endsWith: function(searchString /*, endPosition = @length */){
    if(cof(searchString) == 'RegExp')throw TypeError();
    var that = String($.assertDefined(this))
      , endPosition = arguments[1]
      , len = toLength(that.length)
      , end = endPosition === undefined ? len : Math.min(toLength(endPosition), len);
    searchString += '';
    return that.slice(end - searchString.length, end) === searchString;
  }
});
},{"./$":26,"./$.cof":17,"./$.def":22}],76:[function(require,module,exports){
var $def    = require('./$.def')
  , toIndex = require('./$').toIndex
  , fromCharCode = String.fromCharCode;

$def($def.S, 'String', {
  // 21.1.2.2 String.fromCodePoint(...codePoints)
  fromCodePoint: function(x){ // eslint-disable-line no-unused-vars
    var res = []
      , len = arguments.length
      , i   = 0
      , code;
    while(len > i){
      code = +arguments[i++];
      if(toIndex(code, 0x10ffff) !== code)throw RangeError(code + ' is not a valid code point');
      res.push(code < 0x10000
        ? fromCharCode(code)
        : fromCharCode(((code -= 0x10000) >> 10) + 0xd800, code % 0x400 + 0xdc00)
      );
    } return res.join('');
  }
});
},{"./$":26,"./$.def":22}],77:[function(require,module,exports){
'use strict';
var $    = require('./$')
  , cof  = require('./$.cof')
  , $def = require('./$.def');

$def($def.P, 'String', {
  // 21.1.3.7 String.prototype.includes(searchString, position = 0)
  includes: function(searchString /*, position = 0 */){
    if(cof(searchString) == 'RegExp')throw TypeError();
    return !!~String($.assertDefined(this)).indexOf(searchString, arguments[1]);
  }
});
},{"./$":26,"./$.cof":17,"./$.def":22}],78:[function(require,module,exports){
var set   = require('./$').set
  , at    = require('./$.string-at')(true)
  , ITER  = require('./$.uid').safe('iter')
  , $iter = require('./$.iter')
  , step  = $iter.step;

// 21.1.3.27 String.prototype[@@iterator]()
$iter.std(String, 'String', function(iterated){
  set(this, ITER, {o: String(iterated), i: 0});
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function(){
  var iter  = this[ITER]
    , O     = iter.o
    , index = iter.i
    , point;
  if(index >= O.length)return step(1);
  point = at.call(O, index);
  iter.i += point.length;
  return step(0, point);
});
},{"./$":26,"./$.iter":25,"./$.string-at":33,"./$.uid":35}],79:[function(require,module,exports){
var $    = require('./$')
  , $def = require('./$.def');

$def($def.S, 'String', {
  // 21.1.2.4 String.raw(callSite, ...substitutions)
  raw: function(callSite){
    var raw = $.toObject(callSite.raw)
      , len = $.toLength(raw.length)
      , sln = arguments.length
      , res = []
      , i   = 0;
    while(len > i){
      res.push(String(raw[i++]));
      if(i < sln)res.push(String(arguments[i]));
    } return res.join('');
  }
});
},{"./$":26,"./$.def":22}],80:[function(require,module,exports){
'use strict';
var $    = require('./$')
  , $def = require('./$.def');

$def($def.P, 'String', {
  // 21.1.3.13 String.prototype.repeat(count)
  repeat: function(count){
    var str = String($.assertDefined(this))
      , res = ''
      , n   = $.toInteger(count);
    if(n < 0 || n == Infinity)throw RangeError("Count can't be negative");
    for(;n > 0; (n >>>= 1) && (str += str))if(n & 1)res += str;
    return res;
  }
});
},{"./$":26,"./$.def":22}],81:[function(require,module,exports){
'use strict';
var $    = require('./$')
  , cof  = require('./$.cof')
  , $def = require('./$.def');

$def($def.P, 'String', {
  // 21.1.3.18 String.prototype.startsWith(searchString [, position ])
  startsWith: function(searchString /*, position = 0 */){
    if(cof(searchString) == 'RegExp')throw TypeError();
    var that  = String($.assertDefined(this))
      , index = $.toLength(Math.min(arguments[1], that.length));
    searchString += '';
    return that.slice(index, index + searchString.length) === searchString;
  }
});
},{"./$":26,"./$.cof":17,"./$.def":22}],82:[function(require,module,exports){
'use strict';
// ECMAScript 6 symbols shim
var $        = require('./$')
  , setTag   = require('./$.cof').set
  , uid      = require('./$.uid')
  , $def     = require('./$.def')
  , keyOf    = require('./$.keyof')
  , has      = $.has
  , hide     = $.hide
  , getNames = $.getNames
  , toObject = $.toObject
  , Symbol   = $.g.Symbol
  , Base     = Symbol
  , setter   = false
  , TAG      = uid.safe('tag')
  , SymbolRegistry = {}
  , AllSymbols     = {};

function wrap(tag){
  var sym = AllSymbols[tag] = $.set($.create(Symbol.prototype), TAG, tag);
  $.DESC && setter && $.setDesc(Object.prototype, tag, {
    configurable: true,
    set: function(value){
      hide(this, tag, value);
    }
  });
  return sym;
}

// 19.4.1.1 Symbol([description])
if(!$.isFunction(Symbol)){
  Symbol = function(description){
    if(this instanceof Symbol)throw TypeError('Symbol is not a constructor');
    return wrap(uid(description));
  };
  hide(Symbol.prototype, 'toString', function(){
    return this[TAG];
  });
}
$def($def.G + $def.W, {Symbol: Symbol});

var symbolStatics = {
  // 19.4.2.1 Symbol.for(key)
  'for': function(key){
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function(key){
    return keyOf(SymbolRegistry, key);
  },
  pure: uid.safe,
  set: $.set,
  useSetter: function(){ setter = true; },
  useSimple: function(){ setter = false; }
};
// 19.4.2.2 Symbol.hasInstance
// 19.4.2.3 Symbol.isConcatSpreadable
// 19.4.2.4 Symbol.iterator
// 19.4.2.6 Symbol.match
// 19.4.2.8 Symbol.replace
// 19.4.2.9 Symbol.search
// 19.4.2.10 Symbol.species
// 19.4.2.11 Symbol.split
// 19.4.2.12 Symbol.toPrimitive
// 19.4.2.13 Symbol.toStringTag
// 19.4.2.14 Symbol.unscopables
$.each.call((
    'hasInstance,isConcatSpreadable,iterator,match,replace,search,' +
    'species,split,toPrimitive,toStringTag,unscopables'
  ).split(','), function(it){
    var sym = require('./$.wks')(it);
    symbolStatics[it] = Symbol === Base ? sym : wrap(sym);
  }
);

setter = true;

$def($def.S, 'Symbol', symbolStatics);

$def($def.S + $def.F * (Symbol != Base), 'Object', {
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: function(it){
    var names = getNames(toObject(it)), result = [], key, i = 0;
    while(names.length > i)has(AllSymbols, key = names[i++]) || result.push(key);
    return result;
  },
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: function(it){
    var names = getNames(toObject(it)), result = [], key, i = 0;
    while(names.length > i)has(AllSymbols, key = names[i++]) && result.push(AllSymbols[key]);
    return result;
  }
});

setTag(Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setTag($.g.JSON, 'JSON', true);
},{"./$":26,"./$.cof":17,"./$.def":22,"./$.keyof":27,"./$.uid":35,"./$.wks":37}],83:[function(require,module,exports){
'use strict';
var $         = require('./$')
  , weak      = require('./$.collection-weak')
  , leakStore = weak.leakStore
  , ID        = weak.ID
  , WEAK      = weak.WEAK
  , has       = $.has
  , isObject  = $.isObject
  , isFrozen  = Object.isFrozen || $.core.Object.isFrozen
  , tmp       = {};

// 23.3 WeakMap Objects
var WeakMap = require('./$.collection')('WeakMap', {
  // 23.3.3.3 WeakMap.prototype.get(key)
  get: function(key){
    if(isObject(key)){
      if(isFrozen(key))return leakStore(this).get(key);
      if(has(key, WEAK))return key[WEAK][this[ID]];
    }
  },
  // 23.3.3.5 WeakMap.prototype.set(key, value)
  set: function(key, value){
    return weak.def(this, key, value);
  }
}, weak, true, true);

// IE11 WeakMap frozen keys fix
if($.FW && new WeakMap().set((Object.freeze || Object)(tmp), 7).get(tmp) != 7){
  $.each.call(['delete', 'has', 'get', 'set'], function(key){
    var method = WeakMap.prototype[key];
    WeakMap.prototype[key] = function(a, b){
      // store frozen objects on leaky map
      if(isObject(a) && isFrozen(a)){
        var result = leakStore(this)[key](a, b);
        return key == 'set' ? this : result;
      // store all the rest on native weakmap
      } return method.call(this, a, b);
    };
  });
}
},{"./$":26,"./$.collection":20,"./$.collection-weak":19}],84:[function(require,module,exports){
'use strict';
var weak = require('./$.collection-weak');

// 23.4 WeakSet Objects
require('./$.collection')('WeakSet', {
  // 23.4.3.1 WeakSet.prototype.add(value)
  add: function(value){
    return weak.def(this, value, true);
  }
}, weak, false, true);
},{"./$.collection":20,"./$.collection-weak":19}],85:[function(require,module,exports){
// https://github.com/domenic/Array.prototype.includes
var $def = require('./$.def');
$def($def.P, 'Array', {
  includes: require('./$.array-includes')(true)
});
require('./$.unscope')('includes');
},{"./$.array-includes":13,"./$.def":22,"./$.unscope":36}],86:[function(require,module,exports){
// https://gist.github.com/WebReflection/9353781
var $       = require('./$')
  , $def    = require('./$.def')
  , ownKeys = require('./$.own-keys');

$def($def.S, 'Object', {
  getOwnPropertyDescriptors: function(object){
    var O      = $.toObject(object)
      , result = {};
    $.each.call(ownKeys(O), function(key){
      $.setDesc(result, key, $.desc(0, $.getDesc(O, key)));
    });
    return result;
  }
});
},{"./$":26,"./$.def":22,"./$.own-keys":28}],87:[function(require,module,exports){
// http://goo.gl/XkBrjD
var $    = require('./$')
  , $def = require('./$.def');
function createObjectToArray(isEntries){
  return function(object){
    var O      = $.toObject(object)
      , keys   = $.getKeys(object)
      , length = keys.length
      , i      = 0
      , result = Array(length)
      , key;
    if(isEntries)while(length > i)result[i] = [key = keys[i++], O[key]];
    else while(length > i)result[i] = O[keys[i++]];
    return result;
  };
}
$def($def.S, 'Object', {
  values:  createObjectToArray(false),
  entries: createObjectToArray(true)
});
},{"./$":26,"./$.def":22}],88:[function(require,module,exports){
// https://gist.github.com/kangax/9698100
var $def = require('./$.def');
$def($def.S, 'RegExp', {
  escape: require('./$.replacer')(/([\\\-[\]{}()*+?.,^$|])/g, '\\$1', true)
});
},{"./$.def":22,"./$.replacer":30}],89:[function(require,module,exports){
// https://github.com/mathiasbynens/String.prototype.at
var $def = require('./$.def');
$def($def.P, 'String', {
  at: require('./$.string-at')(true)
});
},{"./$.def":22,"./$.string-at":33}],90:[function(require,module,exports){
// JavaScript 1.6 / Strawman array statics shim
var $       = require('./$')
  , $def    = require('./$.def')
  , core    = $.core
  , statics = {};
function setStatics(keys, length){
  $.each.call(keys.split(','), function(key){
    if(length == undefined && key in core.Array)statics[key] = core.Array[key];
    else if(key in [])statics[key] = require('./$.ctx')(Function.call, [][key], length);
  });
}
setStatics('pop,reverse,shift,keys,values,entries', 1);
setStatics('indexOf,every,some,forEach,map,filter,find,findIndex,includes', 3);
setStatics('join,slice,concat,push,splice,unshift,sort,lastIndexOf,' +
           'reduce,reduceRight,copyWithin,fill,turn');
$def($def.S, 'Array', statics);
},{"./$":26,"./$.ctx":21,"./$.def":22}],91:[function(require,module,exports){
require('./es6.array.iterator');
var $         = require('./$')
  , Iterators = require('./$.iter').Iterators
  , ITERATOR  = require('./$.wks')('iterator')
  , NodeList  = $.g.NodeList;
if($.FW && NodeList && !(ITERATOR in NodeList.prototype)){
  $.hide(NodeList.prototype, ITERATOR, Iterators.Array);
}
Iterators.NodeList = Iterators.Array;
},{"./$":26,"./$.iter":25,"./$.wks":37,"./es6.array.iterator":57}],92:[function(require,module,exports){
var $def  = require('./$.def')
  , $task = require('./$.task');
$def($def.G + $def.B, {
  setImmediate:   $task.set,
  clearImmediate: $task.clear
});
},{"./$.def":22,"./$.task":34}],93:[function(require,module,exports){
// ie9- setTimeout & setInterval additional parameters fix
var $       = require('./$')
  , $def    = require('./$.def')
  , invoke  = require('./$.invoke')
  , partial = require('./$.partial')
  , MSIE    = !!$.g.navigator && /MSIE .\./.test(navigator.userAgent); // <- dirty ie9- check
function wrap(set){
  return MSIE ? function(fn, time /*, ...args */){
    return set(invoke(
      partial,
      [].slice.call(arguments, 2),
      $.isFunction(fn) ? fn : Function(fn)
    ), time);
  } : set;
}
$def($def.G + $def.B + $def.F * MSIE, {
  setTimeout:  wrap($.g.setTimeout),
  setInterval: wrap($.g.setInterval)
});
},{"./$":26,"./$.def":22,"./$.invoke":24,"./$.partial":29}],94:[function(require,module,exports){
require('./modules/es5');
require('./modules/es6.symbol');
require('./modules/es6.object.assign');
require('./modules/es6.object.is');
require('./modules/es6.object.set-prototype-of');
require('./modules/es6.object.to-string');
require('./modules/es6.object.statics-accept-primitives');
require('./modules/es6.function.name');
require('./modules/es6.number.constructor');
require('./modules/es6.number.statics');
require('./modules/es6.math');
require('./modules/es6.string.from-code-point');
require('./modules/es6.string.raw');
require('./modules/es6.string.iterator');
require('./modules/es6.string.code-point-at');
require('./modules/es6.string.ends-with');
require('./modules/es6.string.includes');
require('./modules/es6.string.repeat');
require('./modules/es6.string.starts-with');
require('./modules/es6.array.from');
require('./modules/es6.array.of');
require('./modules/es6.array.iterator');
require('./modules/es6.array.species');
require('./modules/es6.array.copy-within');
require('./modules/es6.array.fill');
require('./modules/es6.array.find');
require('./modules/es6.array.find-index');
require('./modules/es6.regexp');
require('./modules/es6.promise');
require('./modules/es6.map');
require('./modules/es6.set');
require('./modules/es6.weak-map');
require('./modules/es6.weak-set');
require('./modules/es6.reflect');
require('./modules/es7.array.includes');
require('./modules/es7.string.at');
require('./modules/es7.regexp.escape');
require('./modules/es7.object.get-own-property-descriptors');
require('./modules/es7.object.to-array');
require('./modules/js.array.statics');
require('./modules/web.timers');
require('./modules/web.immediate');
require('./modules/web.dom.iterable');
module.exports = require('./modules/$').core;
},{"./modules/$":26,"./modules/es5":51,"./modules/es6.array.copy-within":52,"./modules/es6.array.fill":53,"./modules/es6.array.find":55,"./modules/es6.array.find-index":54,"./modules/es6.array.from":56,"./modules/es6.array.iterator":57,"./modules/es6.array.of":58,"./modules/es6.array.species":59,"./modules/es6.function.name":60,"./modules/es6.map":61,"./modules/es6.math":62,"./modules/es6.number.constructor":63,"./modules/es6.number.statics":64,"./modules/es6.object.assign":65,"./modules/es6.object.is":66,"./modules/es6.object.set-prototype-of":67,"./modules/es6.object.statics-accept-primitives":68,"./modules/es6.object.to-string":69,"./modules/es6.promise":70,"./modules/es6.reflect":71,"./modules/es6.regexp":72,"./modules/es6.set":73,"./modules/es6.string.code-point-at":74,"./modules/es6.string.ends-with":75,"./modules/es6.string.from-code-point":76,"./modules/es6.string.includes":77,"./modules/es6.string.iterator":78,"./modules/es6.string.raw":79,"./modules/es6.string.repeat":80,"./modules/es6.string.starts-with":81,"./modules/es6.symbol":82,"./modules/es6.weak-map":83,"./modules/es6.weak-set":84,"./modules/es7.array.includes":85,"./modules/es7.object.get-own-property-descriptors":86,"./modules/es7.object.to-array":87,"./modules/es7.regexp.escape":88,"./modules/es7.string.at":89,"./modules/js.array.statics":90,"./modules/web.dom.iterable":91,"./modules/web.immediate":92,"./modules/web.timers":93}],95:[function(require,module,exports){
(function (global){
// This method of obtaining a reference to the global object needs to be
// kept identical to the way it is obtained in runtime.js
var g =
  typeof global === "object" ? global :
  typeof window === "object" ? window : this;

var hasOwn = Object.prototype.hasOwnProperty;
var hadRuntime = hasOwn.call(g, "regeneratorRuntime");
var oldRuntime = hadRuntime && g.regeneratorRuntime;
delete g.regeneratorRuntime; // Force reevalutation of runtime.js.

module.exports = require("./runtime");

if (hadRuntime) {
  // Restore the original runtime.
  g.regeneratorRuntime = oldRuntime;
} else {
  // Remove the global property added by runtime.js.
  delete g.regeneratorRuntime;
}

module.exports = { "default": module.exports, __esModule: true };

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./runtime":96}],96:[function(require,module,exports){
(function (global){
/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * https://raw.github.com/facebook/regenerator/master/LICENSE file. An
 * additional grant of patent rights can be found in the PATENTS file in
 * the same directory.
 */

"use strict";

var _core = require("babel-runtime/core-js")["default"];

!(function (global) {
  "use strict";

  var hasOwn = Object.prototype.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var iteratorSymbol = typeof _core.Symbol === "function" && _core.Symbol.iterator || "@@iterator";

  var inModule = typeof module === "object";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    if (inModule) {
      // If regeneratorRuntime is defined globally and we're in a module,
      // make the exports object identical to regeneratorRuntime.
      module.exports = runtime;
    }
    // Don't bother evaluating the rest of this file if the runtime was
    // already defined globally.
    return;
  }

  // Define the runtime globally (as expected by generated code) as either
  // module.exports (if we're in a module) or a new, empty object.
  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

  function wrap(innerFn, outerFn, self, tryLocsList) {
    return new Generator(innerFn, outerFn, self || null, tryLocsList || []);
  }
  runtime.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype;
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunction.displayName = "GeneratorFunction";

  runtime.isGeneratorFunction = function (genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor ? ctor === GeneratorFunction ||
    // For the native GeneratorFunction constructor, the best we can
    // do is to check its .name property.
    (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
  };

  runtime.mark = function (genFun) {
    genFun.__proto__ = GeneratorFunctionPrototype;
    genFun.prototype = _core.Object.create(Gp);
    return genFun;
  };

  runtime.async = function (innerFn, outerFn, self, tryLocsList) {
    return new _core.Promise(function (resolve, reject) {
      var generator = wrap(innerFn, outerFn, self, tryLocsList);
      var callNext = step.bind(generator.next);
      var callThrow = step.bind(generator["throw"]);

      function step(arg) {
        var record = tryCatch(this, null, arg);
        if (record.type === "throw") {
          reject(record.arg);
          return;
        }

        var info = record.arg;
        if (info.done) {
          resolve(info.value);
        } else {
          _core.Promise.resolve(info.value).then(callNext, callThrow);
        }
      }

      callNext();
    });
  };

  function Generator(innerFn, outerFn, self, tryLocsList) {
    var generator = outerFn ? _core.Object.create(outerFn.prototype) : this;
    var context = new Context(tryLocsList);
    var state = GenStateSuspendedStart;

    function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var record = tryCatch(delegate.iterator[method], delegate.iterator, arg);

          if (record.type === "throw") {
            context.delegate = null;

            // Like returning generator.throw(uncaught), but without the
            // overhead of an extra function call.
            method = "throw";
            arg = record.arg;

            continue;
          }

          // Delegate generator ran and handled its own exceptions so
          // regardless of what the method was, we continue as if it is
          // "next" with an undefined arg.
          method = "next";
          arg = undefined;

          var info = record.arg;
          if (info.done) {
            context[delegate.resultName] = info.value;
            context.next = delegate.nextLoc;
          } else {
            state = GenStateSuspendedYield;
            return info;
          }

          context.delegate = null;
        }

        if (method === "next") {
          if (state === GenStateSuspendedStart && typeof arg !== "undefined") {
            // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
            throw new TypeError("attempt to send " + JSON.stringify(arg) + " to newborn generator");
          }

          if (state === GenStateSuspendedYield) {
            context.sent = arg;
          } else {
            delete context.sent;
          }
        } else if (method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw arg;
          }

          if (context.dispatchException(arg)) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            method = "next";
            arg = undefined;
          }
        } else if (method === "return") {
          context.abrupt("return", arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done ? GenStateCompleted : GenStateSuspendedYield;

          var info = {
            value: record.arg,
            done: context.done
          };

          if (record.arg === ContinueSentinel) {
            if (context.delegate && method === "next") {
              // Deliberately forget the last sent value so that we don't
              // accidentally pass it on to the delegate.
              arg = undefined;
            }
          } else {
            return info;
          }
        } else if (record.type === "throw") {
          state = GenStateCompleted;

          if (method === "next") {
            context.dispatchException(record.arg);
          } else {
            arg = record.arg;
          }
        }
      }
    }

    generator.next = invoke.bind(generator, "next");
    generator["throw"] = invoke.bind(generator, "throw");
    generator["return"] = invoke.bind(generator, "return");

    return generator;
  }

  Gp[iteratorSymbol] = function () {
    return this;
  };

  Gp.toString = function () {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset();
  }

  runtime.keys = function (object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1,
            next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  runtime.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function reset() {
      this.prev = 0;
      this.next = 0;
      this.sent = undefined;
      this.done = false;
      this.delegate = null;

      this.tryEntries.forEach(resetTryEntry);

      // Pre-initialize at least 20 temporary variables to enable hidden
      // class optimizations for simple generators.
      for (var tempIndex = 0, tempName; hasOwn.call(this, tempName = "t" + tempIndex) || tempIndex < 20; ++tempIndex) {
        this[tempName] = null;
      }
    },

    stop: function stop() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function dispatchException(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;
        return !!caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }
          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }
          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }
          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function abrupt(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg < finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.next = finallyEntry.finallyLoc;
      } else {
        this.complete(record);
      }

      return ContinueSentinel;
    },

    complete: function complete(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" || record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = record.arg;
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function finish(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          return this.complete(entry.completion, entry.afterLoc);
        }
      }
    },

    "catch": function _catch(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function delegateYield(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      return ContinueSentinel;
    }
  };
})(
// Among the various tricks for obtaining a reference to the global
// object, this seems to be the most reliable technique that does not
// use indirect eval (which violates Content Security Policy).
typeof global === "object" ? global : typeof window === "object" ? window : undefined);
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"babel-runtime/core-js":11}],97:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],98:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],99:[function(require,module,exports){
(function (global){
if(global.process) module.exports = require('./ws/' + 'node.js');
else module.exports = require('./ws/browser.js');

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./ws/browser.js":100}],100:[function(require,module,exports){
var Emitter = require('y-emitter'),
    
    on = require('u-proto/on'),
    once = require('u-proto/once');

module.exports = function getPeer(url){
  var inP,outP,ws;
  
  if(!url.match(/^wss?:/)){
    if(url.charAt(0) == '/') url = location.origin.replace(/^http/,'ws') + url + '/';
    else url = document.baseURI.replace(/^http/,'ws') + url + '/';
  }
  
  ws = new WebSocket(url);
  
  inP = new Emitter.Hybrid();
  outP = new Emitter.Hybrid();
  Emitter.chain(inP,outP);
  
  ws[once]('open',onceOpen,inP);
  ws[once]('close',onceClosed,inP);
  ws[on]('message',onMsg,inP);
  
  inP.on('msg',sendMsg,ws);
  inP.once('closed',close,ws);
  
  return outP;
}

function onceOpen(e,en,inP){
  inP.set('ready');
}

function onceClosed(e,en,inP){
  inP.unset('ready');
  inP.set('closed');
}

function onMsg(e,en,inP){
  var msg = e.data;
  
  msg = JSON.parse(msg);
  inP.give('msg',msg);
}

function sendMsg(msg,en,ws){
  ws.send(JSON.stringify(msg));
}

function close(e,en,ws){
  ws.close();
  
  this.unset('ready');
  this.set('closed');
}


},{"u-proto/on":114,"u-proto/once":115,"y-emitter":125}],101:[function(require,module,exports){
var Su = require('u-su'),
    Emitter = require('y-emitter'),
    
    rtc,
    
    emitter = Su(),
    peers = Su(),
    srv = Su(),
    id = Su(),
    
    peerPlugins = new Emitter(),
    serverPlugins = new Emitter(),
    plugins = new Emitter(),
    
    Client;

// Client object

Client = module.exports = function Client(server){
  var rooms = {},
      s = new Server(server);
  
  Emitter.Target.call(this,emitter);
  this[srv] = server;
  
  server.once('ready',onceServerReady,this,s);
  server.on('msg',onServerMsg,this,rooms,s);
  server.once('closed',onceServerClosed,this,rooms,s);
  
  plugins.give('client',this);
};

Client.plugins = plugins.target;
Client.peerPlugins = peerPlugins.target;
Client.serverPlugins = serverPlugins.target;

function onceServerReady(e,cbc,client,server){
  client[emitter].set('server',server);
}

function closeAll(room){
  var keys = Object.keys(room[peers]),
      i,j;
  
  for(j = 0;j < keys.length;j++){
    i = keys[j];
    room[peers][i][emitter].set('closed');
  }
  
}

function onServerMsg(msg,cbc,client,rooms,server){
  var room,peer,i,pid;
  
  if(msg.from){
    room = rooms[msg.rid];
    if(!room) return;
    
    peer = room[peers][msg.from];
    if(!peer) return;
    
    if(msg.type == 'msg') peer[emitter].give('msg',msg.data);
    else peerPlugins.give(msg.type,[msg.data,peer[emitter]]);
  }else if(msg.rid) switch(msg.type){
      
    case 'hi':
      room = rooms[msg.rid];
      if(!room){
        room = new Room(this,msg.rid,msg.pids);
        rooms[msg.rid] = room;
        client[emitter].give('room',room);
        return;
      }
      
      for(i = 0;i < msg.pids.length;i++){
        pid = msg.pids[i];
        
        peer = room[peers][pid];
        if(!peer){
          peer = new Peer(this,msg.rid,pid);
          room[peers][pid] = peer;
          room[emitter].give('peer',peer);
        }
      }
      
      break;
      
    case 'bye':
      
      room = rooms[msg.rid];
      if(!room) return;
      
      if(!msg.pids.length){
        delete rooms[msg.rid];
        
        closeAll(room);
        room[emitter].set('closed');
        return;
      }
      
      for(i = 0;i < msg.pids.length;i++){
        pid = msg.pids[i];
        
        peer = room[peers][pid];
        if(!peer) return;
        
        delete room[peers][pid];
        peer[emitter].set('closed');
      }
      
      break;
    
  }else{
    if(msg.type == 'msg') server[emitter].give('msg',msg.data);
    else serverPlugins.give(msg.type,[msg.data,serverPlugins]);
  }
  
}

function onceServerClosed(e,cbc,client,rooms,server){
  var keys,i,j,rs = [];
  
  keys = Object.keys(rooms);
  for(j = 0;j < keys.length;j++){
    i = keys[j];
    rs.push(rooms[i]);
    delete rooms[i];
  }
  
  for(i = 0;i < rs.length;i++){
    closeAll(rs[i]);
    rs[i][emitter].set('closed');
  }
  
  client[emitter].unset('server');
  server[emitter].set('closed');
  client[emitter].set('closed');
}

Client.prototype = new Emitter.Target();
Client.prototype.constructor = Client;

Object.defineProperties(Client.prototype,{
  
  close: {value: function(){
    this[srv].set('closed');
  }}
  
});

// Server object

function Server(server){
  Emitter.Target.call(this,emitter);
  this[srv] = server;
  
  plugins.give('server',this);
}

Server.prototype = new Emitter.Target();
Server.prototype.constructor = Server;

Object.defineProperties(Server.prototype,{
  
  give: {value: function(type,data){
    
    this[srv].give('msg',{
      type: type,
      data: data
    });
    
  }},
  
  send: {value: function(data){
    this.give('msg',data);
  }},
  
  close: {value: function(){
    this[srv].set('closed');
  }}
  
});

// Room object

function Room(server,rid,ps){
  var i;
  
  Emitter.Target.call(this,emitter);
  
  this[srv] = server;
  this[id] = rid;
  this[peers] = {};
  
  for(i = 0;i < ps.length;i++) this[peers][ps[i]] = new Peer(server,rid,ps[i]);
  this.until('peer').listeners.change().listen(oncePeerListened,[this]);
  
  plugins.give('room',this);
}

Client.Room = Room;

function oncePeerListened(room){
  var keys,i,j;
  
  keys = Object.keys(room[peers]);
  for(j = 0;j < keys.length;j++){
    i = keys[j];
    room[emitter].give('peer',room[peers][i]);
  }
}

Room.prototype = new Emitter.Target();
Room.prototype.constructor = Room;

Object.defineProperties(Room.prototype,{
  
  give: {value: function(type,data){
    type = type.slice(0,127);
    
    this[srv].give('msg',{
      to: 'all',
      rid: this[id],
      
      type: type,
      data: data
    });
  }},
  
  send: {value: function(data){
    this.give('msg',data);
  }},
  
  getPeers: {value: function(){
    var result = [],
        i,j,keys;
    
    keys = Object.keys(this[peers]);
    for(j = 0;j < keys.length;j++){
      i = keys[j];
      result.push(this[peers]);
    }
    
    return result;
  }}
  
});

// Peer object

function Peer(server,rid,pid){
  Emitter.Target.call(this,emitter);
  
  this[srv] = server;
  this[id] = {
    rid: rid,
    pid: pid
  };
  
  plugins.give('peer',this);
}

Client.Peer = Peer;

Peer.prototype = new Emitter.Target();
Peer.prototype.constructor = Peer;

Object.defineProperties(Peer.prototype,{
  
  give: {value: function(type,data){
    type = type.slice(0,127);
    
    this[srv].give('msg',{
      to: this[id].pid,
      rid: this[id].rid,
      
      type: type,
      data: data
    });
  }},
  
  send: {value: function(data){
    this.give('msg',data);
  }}
  
});

// Plugins

rtc = require('./client/rtc.js');
if(rtc.Pc) require('./client/rtc-stream.js');

},{"./client/rtc-stream.js":102,"./client/rtc.js":103,"u-su":122,"y-emitter":125}],102:[function(require,module,exports){
var Su = require('u-su'),
    unique = require('u-rand').unique,
    wrap = require('y-walk').wrap,
    
    walk = require('u-proto/walk'),
    until = require('u-proto/until'),
    
    Client = require('../client.js'),
    rtc = require('./rtc.js'),
    
    event = '3M9E3T-F9qsz',
    
    streams = Su();

function* handleIce(peer,sid){
  var e = yield this[until]('icecandidate'),
      ice;
  
  if(!(e && e.candidate)) return;
  this[walk](handleIce,arguments);
  
  ice = {
    candidate: e.candidate.candidate,
    sdpMid: e.candidate.sdpMid,
    sdpMLineIndex: e.candidate.sdpMLineIndex
  };
  
  peer.give(event,{
    type: 'ice',
    sid: sid,
    ice: ice
  });
  
}

function* closePc(pc){
  yield this.until('closed');
  pc.close();
}

Object.defineProperty(Client.Peer.prototype,'sendStream',{value: wrap(function*(stream,opts){
  var pc = new rtc.Pc(opts || rtc.PcOpts),
      sid = unique(),
      offer,msg;
  
  this.give(event,{
    type: 'new',
    opt: opts,
    sid: sid
  });
  
  this[streams] = this[streams] || {};
  this[streams][sid] = pc;
  
  pc[walk](handleIce,[this,sid]);
  pc.addStream(stream);
  
  offer = yield rtc.offer(pc);
  yield rtc.local(pc,offer);
  
  msg = {
    type: offer.type,
    sdp: offer.sdp
  };
  
  this.give(event,{
    type: 'offer',
    sid: sid,
    offer: msg
  });
  
})});

Client.peerPlugins.walk(function* cb(){
  var args,msg,peer,emitter,pc,e,answer;
  
  args = yield this.until(event);
  this.walk(cb);
  
  msg = args[0];
  emitter = args[1];
  peer = emitter.target;
  
  peer[streams] = peer[streams] || {};
  
  switch(msg.type){
    
    case 'new':
      if(peer[streams][msg.sid]) return;
      
      pc = peer[streams][msg.sid] = new rtc.Pc(msg.opt || rtc.PcOpts);
      pc[walk](handleIce,[peer,msg.sid]);
      emitter.target.walk(closePc,[pc]);
      
      e = yield pc[until]('addstream');
      emitter.give('stream',e.stream);
      
      break;
    
    case 'ice':
      if(!(pc = peer[streams][msg.sid])) return;
      
      rtc.ice(pc,new rtc.Ice(msg.ice));
      
      break;
    
    case 'offer':
      if(!(pc = peer[streams][msg.sid])) return;
      
      yield rtc.remote(pc,new rtc.Sd(msg.offer));
      answer = yield rtc.answer(pc);
      yield rtc.local(pc,answer);
      
      peer.give(event,{
        type: 'answer',
        sid: msg.sid,
        answer: {
          type: answer.type,
          sdp: answer.sdp
        }
      });
      
      break;
    
    case 'answer':
      if(!(pc = peer[streams][msg.sid])) return;
      
      yield rtc.remote(pc,new rtc.Sd(msg.answer));
      
      break;
    
  }
  
});


},{"../client.js":101,"./rtc.js":103,"u-proto/until":117,"u-proto/walk":120,"u-rand":121,"u-su":122,"y-walk":138}],103:[function(require,module,exports){
(function (global){
var pair = require('y-callback/pair'),
    prefix = require('u-proto/prefix');

exports.Pc = global[prefix]('RTCPeerConnection');
exports.Ice = global[prefix]('RTCIceCandidate');
exports.Sd = global[prefix]('RTCSessionDescription');

exports.PcOpts=
{
  iceServers: [
    {urls: 'stun:stun.l.google.com:19302'},
    {urls: 'stun:stun1.l.google.com:19302'},
    {urls: 'stun:stun2.l.google.com:19302'},
    {urls: 'stun:stun3.l.google.com:19302'},
    {urls: 'stun:stun4.l.google.com:19302'},
    {
      urls: 'turn:192.158.29.39:3478?transport=udp',
      credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
      username: '28224511:1379330808'
    },
    {
      urls: 'turn:192.158.29.39:3478?transport=tcp',
      credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
      username: '28224511:1379330808'
    }
  ]
};

(function(){
  var i;
  
  for(i = 0;i < exports.PcOpts.iceServers.length;i++){
    exports.PcOpts.iceServers[i].url = exports.PcOpts.iceServers[i].urls
  }
  
})();

try{
  
  (new exports.Pc({iceServers: []})).createOffer().then(function(){},function(){});
  
  exports.offer = function(peer,opt){
    return peer.createOffer(opt);
  };
  
  exports.answer = function(peer){
    return peer.createAnswer();
  };
  
  exports.local = function(peer,sd){
    return peer.setLocalDescription(sd);
  };
  
  exports.remote = function(peer,sd){
    return peer.setRemoteDescription(sd);
  };
  
  exports.ice = function(peer,ice){
    return peer.addIceCandidate(ice);
  };
  
}catch(e){
  
  exports.offer = function(peer,opt){
    var p = pair();
    
    peer.createOffer(p[0],p[1]);
    return p;
  };
  
  exports.answer = function(peer){
    var p = pair();
    
    peer.createAnswer(p[0],p[1]);
    return p;
  };
  
  exports.local = function(peer,sd){
    var p = pair();
    
    peer.setLocalDescription(sd,p[0],p[1]);
    return p;
  };
  
  exports.remote = function(peer,sd){
    var p = pair();
    
    peer.setRemoteDescription(sd,p[0],p[1]);
    return p;
  };
  
  exports.ice = function(peer,ice){
    var p = pair();
    
    peer.addIceCandidate(ice,p[0],p[1]);
    return p;
  };
  
}


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"u-proto/prefix":116,"y-callback/pair":124}],104:[function(require,module,exports){
var Su = require('u-su'),
    unique = require('u-rand').unique,
    apply = require('u-proto/apply'),
    
    sheet = require('./sheet.js'),
    
    rule = Su(),
    name = Su(),
    
    Animation;

Animation = module.exports = function Animation(){
  var i = sheet.cssRules.length;
  
  this[name] = 'anim-' + unique();
  
  try{ sheet.insertRule('@keyframes ' + this[name] + '{}',i); }
  catch(e){ sheet.insertRule('@-webkit-keyframes ' + this[name] + '{}',i); }
  
  this[rule] = sheet.cssRules.item(i);
};

Object.defineProperties(Animation.prototype,{
  
  toString: {value: function(){
    return this[name];
  }},
  
  set: {value: function(key,obj){
    var kfr = this[rule].findRule(key);
    
    if(!kfr){
      this[rule].appendRule(key + ' {}');
      kfr = this[rule].findRule(key);
    }
    
    kfr.style[apply](obj);
    
    return this;
  }},
  
  delete: {value: function(key){
    this[rule].deleteRule(key);
  }}
  
});


},{"./sheet.js":111,"u-proto/apply":113,"u-rand":121,"u-su":122}],105:[function(require,module,exports){
var unique = require('u-rand').unique,
    
    sheet = require('./sheet.js'),
    check,style;

sheet.insertRule('.test' + unique() + '{}',0);
style = sheet.cssRules.item(0).style;

check = module.exports = function check(key,value){
  var ret;
  
  if(!check.key(key)) return false;
  
  style[key] = value;
  ret = style[key] != '';
  style[key] = '';
  
  return ret;
};

check.key = function(key){
  return style[key] === '';
};


},{"./sheet.js":111,"u-rand":121}],106:[function(require,module,exports){
var unique = require('u-rand').unique,
    Su = require('u-su'),
    apply = require('u-proto/apply'),
    
    sheet = require('./sheet.js'),
    
    rule = Su(),
    name = Su(),
    selector = Su(),
    
    canAnd = Su(),
    canPs = Su(),
    
    Class;

function init(cl,n,s){
  var i = sheet.cssRules.length;
  
  sheet.insertRule(s + '{}',i);
  
  cl[rule] = sheet.cssRules.item(i);
  cl[name] = n;
  cl[selector] = s;
}

Class = module.exports = function Class(){
  var name = 'css-' + unique();
  
  this[canAnd] = true;
  this[canPs] = true;
  
  init(this,name,'.' + name);
};

Object.defineProperties(Class.prototype,{
  
  apply: {value: function(obj){
    this[rule].style[apply](obj);
    return this;
  }},
  
  toString: {value: function(){
    return ' ' + this[name] + ' ';
  }},
  
  get: {value: function(key){
    return this[rule].style[key];
  }},
  
  and: {value: function(addition){
    var s,cl;
    
    if(!this[canAnd]) return;
    
    s = (addition.toString()).replace(/[^\-a-zA-Z0-9_]/g,'') + this[selector];
    cl = Object.create(Class.prototype);
    
    cl[canAnd] = false;
    cl[canPs] = this[canPs];
    
    init(cl,this[name],s);
    
    return cl;
  }},
  
  sub: {value: function(other){
    var s,cl;
    
    s = this[selector] + ' ' + other[selector];
    cl = Object.create(Class.prototype);
    
    cl[canAnd] = false;
    cl[canPs] = false;
    
    init(cl,this[name] + ' ' + other[name],s);
    
    return cl;
  }},
  
  or: {value: function(other){
    var s,cl;
    
    s = this[selector] + ', ' + other[selector];
    cl = Object.create(Class.prototype);
    
    cl[canAnd] = false;
    cl[canPs] = false;
    
    init(cl,this[name] + ' ' + other[name],s);
    
    return cl;
  }},
  
  psc: {value: function(psc){
    var s,cl;
    
    if(!this[canPs]) return;
    
    s = this[selector] + ':' + (psc.toString()).replace(/[^\-a-zA-Z0-9_()]/g,'');
    cl = Object.create(Class.prototype);
    
    cl[canAnd] = this[canAnd];
    cl[canPs] = true;
    
    init(cl,this[name],s);
    
    return cl;
  }},
  
  pse: {value: function(pse){
    var s,cl;
    
    if(!this[canPs]) return;
    
    s = this[selector] + '::' + (pse.toString()).replace(/[^\-a-zA-Z0-9_()]/g,'');
    cl = Object.create(Class.prototype);
    
    cl[canAnd] = this[canAnd];
    cl[canPs] = false;
    
    init(cl,this[name],s);
    
    return cl;
  }},
  
  attr: {value: function(key,test,value){
    var s,cl;
    
    if(!this[canPs]) return;
    
    key = (key.toString()).replace(/[^\-a-zA-Z0-9_()]/g,'');
    test = (test.toString()).replace(/[\[\]]/g,'');
    value = (value.toString()).replace(/(\\*)"/g,quoteRepl);
    
    s = this[selector] + '[' + key + test + '"' + value + '"]';
    cl = Object.create(Class.prototype);
    
    cl[canAnd] = this[canAnd];
    cl[canPs] = true;
    
    init(cl,this[name],s);
    
    return cl;
  }},
  
  destroy: {value: function(){
    var i;
    
    for(i = 0;i < sheet.cssRules.length;i++) if(sheet.cssRules.item(i) == this[rule]) break;
    sheet.deleteRule(i);
  }}
  
});

function quoteRepl(m,s1){
  if(!(s1.length % 2)) return '\\' + m;
  return m;
}


},{"./sheet.js":111,"u-proto/apply":113,"u-rand":121,"u-su":122}],107:[function(require,module,exports){
(function (global){
if(global.FontFace) module.exports = require('./font/modern.js');
else module.exports = require('./font/legacy.js');

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./font/legacy.js":108,"./font/modern.js":109}],108:[function(require,module,exports){
var Su = require('u-su'),
    unique = require('u-rand').unique,
    
    sheet = require('../sheet.js'),
    
    family = Su(),
    face = Su(),
    
    Font;

Font = module.exports = function Font(){
  this[family] = 'font-' + unique();
};

Object.defineProperties(Font.prototype,{
  
  toString: {value: function(){
    return this[family];
  }},
  
  add: {value: function(data){
    var ff = data[face],
        i = sheet.cssRules.length,
        txt;
    
    if(!ff){
      txt = '@font-face { ';
      txt += 'font-family: "' + this[family] + '"; ';
      txt += 'src: url("' + encodeURI(data.url) + '"); ';
      
      if(data.style)            txt += 'font-style: ' + data.style + '; ';
      if(data.weight)           txt += 'font-weight: ' + data.weight + '; ';
      if(data.stretch)          txt += 'font-stretch: ' + data.stretch + '; ';
      if(data.unicodeRange)     txt += 'unicode-range: ' + data.unicodeRange + '; ';
      if(data.variant)          txt += 'font-variant: ' + data.variant + '; ';
      if(data.featureSettings)  txt += 'font-feature-settings: ' + data.featureSettings + '; ';
      
      txt += '}';
      
      i = sheet.cssRules.length;
      sheet.insertRule(txt,i);
      
      data[face] = sheet.cssRules.item(i);
    }else sheet.insertRule(ff.cssText,i);
    
    
  }},
  
  delete: {value: function(data){
    var i;
    
    for(i = 0;i < sheet.cssRules.length;i++){
      if(sheet.cssRules.item(i) == data[face]) break;
    }
    
    sheet.deleteRule(i);
  }}
  
});


},{"../sheet.js":111,"u-rand":121,"u-su":122}],109:[function(require,module,exports){
var Su = require('u-su'),
    unique = require('u-rand').unique,
    
    family = Su(),
    face = Su(),
    
    Font;

Font = module.exports = function Font(){
  this[family] = 'font-' + unique();
};

Object.defineProperties(Font.prototype,{
  
  toString: {value: function(){
    return this[family];
  }},
  
  add: {value: function(data){
    var ff = data[face],
        url;
    
    if(!ff){
      url = data.url;
      delete data.url;
      
      ff = data[face] = new FontFace(this[family],'url("' + encodeURI(url) + '")',data);
    }
    
    document.fonts.add(ff);
  }},
  
  delete: {value: function(data){
    document.fonts.delete(data[face]);
  }}
  
});


},{"u-rand":121,"u-su":122}],110:[function(require,module,exports){
var check = require('./check.js');

function hyphenize(m){
  return '-' + m.toLowerCase();
}

module.exports = function(key){
  var fl,ret;
  
  key = key.toString();
  if(check.key(key)) return key;
  
  key = key.replace(/[A-Z]/g,hyphenize);
  
  ret = '-webkit-' + key;
  if(check.key(ret)) return ret;
  
  ret = '-moz-' + key;
  if(check.key(ret)) return ret;
  
  ret = '-ms-' + key;
  if(check.key(ret)) return ret;
  
  ret = '-o-' + key;
  if(check.key(ret)) return ret;
};


},{"./check.js":105}],111:[function(require,module,exports){
var style = document.createElement('style');

document.head.appendChild(style);
module.exports = style.sheet;

},{}],112:[function(require,module,exports){
(function (global){
var apply = require('u-proto/apply'),
    elem;

elem = module.exports = function(jsonml,g){
  var i,ret,document,Node;
  
  g = g || global;
  document = g.document || global.document;
  Node = g.Node || global.Node;
  
  if(jsonml[0] instanceof Node) ret = jsonml[0];
  else ret = document.createElement(jsonml[0]);
  
  for(i = 1;i < jsonml.length;i++){
    if(jsonml[i] instanceof Node) ret.appendChild(jsonml[i]);
    else switch(jsonml[i].constructor){
      
      case Array:
        ret.appendChild(elem(jsonml[i]));
        break;
      
      case Object:
        ret[apply](jsonml[i]);
        break;
      
      default:
        ret.appendChild(document.createTextNode(jsonml[i].toString()));
        break;
        
    }
  }
  
  return ret;
};

elem.frag = function(g){
  g = g || global;
  return g.document.createDocumentFragment();
};

elem.txt = function(txt,g){
  g = g || global;
  return g.document.createTextNode(txt);
};


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"u-proto/apply":113}],113:[function(require,module,exports){
(function (global){
var Su = require('u-su'),
    getKey,
    
    apply = module.exports = Su();

Su.define(Object.prototype,apply,function(data){
  var keys = Object.keys(data),
      i,j;
  
  for(j = 0;j < keys.length;j++){
    i = keys[j];
    
    if( typeof this[i] == 'object' &&
        data[i] && data[i].constructor == Object ) this[i][apply](data[i]);
    else this[i] = data[i];
  }
  
  return this;
});

if(global.CSSStyleDeclaration){
  getKey = require('u-css/get-key');
  
  Su.define(CSSStyleDeclaration.prototype,apply,function(obj){
    var keys = Object.keys(obj),
        i,j,k;
    
    for(j = 0;j < keys.length;j++){
      i = getKey(k = keys[j]);
      if(!i) continue;
      
      this[i] = obj[k];
    }
    
    return this;
  });
  
}


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"u-css/get-key":110,"u-su":122}],114:[function(require,module,exports){
var Su = require('u-su'),
    walk = require('y-walk'),
    
    until = require('./until.js'),
    
    active = Su(),
    on = Su();

module.exports = on;

function Cbc(){
  this[active] = true;
}

Object.defineProperty(Cbc.prototype,'detach',{value: function(){
  this[active] = false;
}});

function* callOn(cbc,args,event,listener){
  
  args[0] = yield this[until](event);
  while(cbc[active]){
    walk(listener,args,this);
    args[0] = yield this[until](event);
  }
  
}

Su.define(Object.prototype,on,function(){
  var event = arguments[0],
      listener = arguments[1],
      cbc = new Cbc();
  
  arguments[1] = cbc;
  walk(callOn,[cbc,arguments,event,listener],this);
  
  return cbc;
});


},{"./until.js":117,"u-su":122,"y-walk":138}],115:[function(require,module,exports){
var Su = require('u-su'),
    walk = require('y-walk'),
    
    until = require('./until.js'),
    
    active = Su(),
    once = Su();

module.exports = once;

function Cbc(){
  this[active] = true;
}

Object.defineProperty(Cbc.prototype,'detach',{value: function(){
  this[active] = false;
}});

function* callOnce(cbc,args,event,listener){
  
  args[0] = yield this[until](event);
  if(cbc[active]) walk(listener,args,this);
  
}

Su.define(Object.prototype,once,function(){
  var event = arguments[0],
      listener = arguments[1],
      cbc = new Cbc();
  
  arguments[1] = cbc;
  walk(callOnce,[cbc,arguments,event,listener],this);
  
  return cbc;
});


},{"./until.js":117,"u-su":122,"y-walk":138}],116:[function(require,module,exports){
var Su = require('u-su'),
    
    prefix = module.exports = Su();

Su.define(Object.prototype,prefix,function(prop){
  
  if(this[prop]) return this[prop];
  
  prop = prop.charAt(0).toUpperCase() + prop.slice(1);
  
  return  this['webkit' + prop]   ||
          this['moz' + prop]      ||
          this['ms' + prop]       ||
          this['o' + prop];
});


},{"u-su":122}],117:[function(require,module,exports){
(function (global){
module.exports = require('u-su')();
require('./until/EventEmitter.js');
if(global.EventTarget) require('./until/EventTarget.js');

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./until/EventEmitter.js":118,"./until/EventTarget.js":119,"u-su":122}],118:[function(require,module,exports){
var Su = require('u-su'),
    EventEmitter = require('events').EventEmitter,
    Resolver = require('y-resolver'),
    
    until = require('../until.js'),
    resolvers = Su();

Su.define(EventEmitter.prototype,until,function(event){
  var resolver;
  
  this[resolvers] = this[resolvers] || {};
  if(resolver = this[resolvers][event]) return resolver.yielded;
  
  this.once(event,function(){
    delete this[resolvers][event];
    resolver.accept(arguments);
  });
  
  return (this[resolvers][event] = resolver = new Resolver()).yielded;
});


},{"../until.js":117,"events":97,"u-su":122,"y-resolver":126}],119:[function(require,module,exports){
var Su = require('u-su'),
    Resolver = require('y-resolver'),
    
    until = require('../until.js'),
    resolvers = Su();

function callback(e){
  var resolver = this[resolvers][e.type];
  
  delete this[resolvers][e.type];
  this.removeEventListener(e.type,callback,false);
  resolver.accept(e);
}

Su.define(EventTarget.prototype,until,function(event){
  var resolver;
  
  this[resolvers] = this[resolvers] || {};
  if(resolver = this[resolvers][event]) return resolver.yielded;
  
  this.addEventListener(event,callback,false);
  return (this[resolvers][event] = resolver = new Resolver()).yielded;
});


},{"../until.js":117,"u-su":122,"y-resolver":126}],120:[function(require,module,exports){
var walk = require('y-walk'),
    Su = require('u-su'),
    
    wlk = module.exports = Su();

Su.define(Object.prototype,wlk,function(generator,args){
  return walk(generator,args,this);
});


},{"u-su":122,"y-walk":138}],121:[function(require,module,exports){
var dref = 1425044468643;

module.exports = function(n1,n2,decimals){
	var num;
  
	if(n2 == undefined){
		if(n1 > 0){
			n2 = n1;
			n1 = 0;
		}else n2 = 0;
	}else if(typeof n2 == 'boolean'){
		decimals = n2;
		if(n1 > 0){
			n2 = n1;
			n1 = 0;
		}else n2 = 0;
	}
	
	num = n1 + Math.random() * (n2 - n1);
	
	if(!decimals) num = Math.floor(num);
	
	return num;
}

function getLetter(n){
  if(n < 36) return n.toString(36);
  if(n < 62) return (n - 26).toString(36).toUpperCase();
  
  switch(n){
    case 62: return '_';
    case 63: return '-';
    case 64: return '+';
    case 65: return ',';
    case 66: return '.';
    case 67: return '<';
    case 68: return '>';
    case 69: return '=';
    case 70: return '!';
    case 71: return '#';
    case 72: return '@';
    case 73: return '?';
    case 74: return '/';
    case 75: return '&';
    case 76: return '%';
    case 77: return '$';
    case 78: return '*';
    case 79: return ':';
    case 80: return ';';
    case 81: return '"';
    case 82: return "'";
    case 83: return '(';
    case 84: return ')';
    case 85: return '[';
    case 86: return ']';
    case 87: return '\\';
    case 88: return '^';
    case 89: return '`';
    case 90: return '{';
    case 91: return '}';
    case 92: return '|';
    case 93: return '~';
  }
}

function getRandBase(b,n,max){
  var result,mod;
  
  n = (n != null)?n:Math.floor(Math.random() * 1e15);
  if(!n) return '0';
  
  if(b > 36){
    
    result = '';
    while(n > 0){
      mod = n % b;
      n = Math.floor(n / b);
      result = getLetter(mod) + result;
      if(result.length == max) return result;
    }
    
  }else result = n.toString(b);
  
  if(max) return result.substring(0,max)
  
  return result;
}

module.exports.string = function(n,base,useDate){
	var str = '';
	
  if(n == null) n = 10;
  
  if(typeof base != 'number'){
    useDate = base;
    base = 36;
  }
  
	if(useDate){
		str += getRandBase(base,Date.now() - dref);
		str = str.substring(Math.max(str.length - n,0));
	}
	
	while(str.length < n) str += getRandBase(base,null,n - str.length);
	
	return str;
};

var counter = -1;
module.exports.unique = function(n){
  counter = (counter + 1)%1e15;
  
  return getRandBase(62,counter) + '-' + getRandBase(62,Date.now() - dref) + '-' + module.exports.string(n || 5,62);
};


},{}],122:[function(require,module,exports){
(function (global){
var rand = require('u-rand');

if(global.Symbol) module.exports = function(){ return Symbol(); };
else module.exports = function(){ return rand.unique(); };

module.exports.define = function(obj,su,value){
  Object.defineProperty(obj,su,{
    value: value,
    writable: true,
    configurable: true
  });
};


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"u-rand":121}],123:[function(require,module,exports){
(function (global){
var Emitter = require('y-emitter'),
    wrap = require('y-walk').wrap,
    Hybrid = require('y-resolver').Hybrid,
    Su = require('u-su'),
    
    summary = document.getElementById('2nEI77dDCExbZNo'),
    emitter = new Emitter(),
    start = new Hybrid(),
    
    code = global['c3hM9mLiIxK6DYj'],
    data = global['1wqDxiG274aqleT'],
    prefix = global['1ZN9cOC3OuKILjF'],
    title = document.title,
    
    path = Su(),
    
    k = 0,
    
    wapp;

summary.remove();
summary = summary.innerHTML;

wapp = module.exports = emitter.target;
emitter.set('busy');
emitter.syn('rsc ','top rsc');
emitter.syn('path ','top path');

function listener(){
  if(this.readyState == 4){
    if(this.status == 0) this.yd.reject(new Error('A network error happened'));
    else this.yd.accept();
  }
}

wapp.goTo = wrap(function*(rsc,replace){
  var url = prefix + (rsc = (rsc || '').toString()),
      xhr,data,pk,e;
  
  if(!global.history) return location.href = url;
  
  emitter.unset('ready');
  emitter.set('busy');
  
  rsc = rsc.replace(/(\?|#).*$/,'');
  
  xhr = new XMLHttpRequest();
  xhr.yd = new Hybrid();
  xhr.open('GET',prefix + rsc + '?format=json',true);
  xhr.onreadystatechange = listener;
  xhr.send();
  
  k = (k + 1)%1e15;
  pk = k;
  
  try{ yield xhr.yd; }
  catch(e){
    location.href = url;
    throw e;
  }
  
  if(k != pk) return;
  
  data = JSON.parse(xhr.responseText);
  data.code = xhr.status;
  data.rsc = rsc;
  
  e = new Event(data);
  
  if(global.history){
    if(replace) history.replaceState(e,e.title,url);
    else history.pushState(e,e.title,url);
  }
  
  emitter.unset('busy');
  emitter.set('ready');
  
  onPopState({state: e});
});

function onPopState(e){
  var event,en;
  
  k = (k + 1)%1e15;
  
  if(e.state instanceof Event){
    event = e.state;
    
    en = 'rsc ' + event.rsc;
    if(wapp.listeners(en)) emitter.give(en,event);
    else event.next();
    
  }else wapp.goTo(location.href.slice(prefix.length),true);
}

if(global.history) window.addEventListener('popstate',onPopState);

wapp.walk(function*(){
  var obj = {
        rsc: decodeURI(location.href).slice(prefix.length).replace(/(\?|#).*$/,''),
        title: title,
        summary: summary,
        data: data,
        code: code
      },
      e = new Event(obj),
      pk = k;
  
  title = null;
  summary = null;
  data = null;
  code = null;
  
  if(global.history) history.replaceState(e,e.title,location.href);
  
  yield start;
  if(pk != k) return;
  
  emitter.unset('busy');
  emitter.set('ready');
  
  onPopState({state: e});
});

wapp.start = function(){
  start.accept();
};

// Event

function Event(data){
  this.rsc = data.rsc;
  this.title = data.title;
  this.summary = data.summary;
  this.data = data.data;
  this.code = data.code;
  
  this.parts = [];
  this[path] = this.rsc.split('/');
}

Object.defineProperties(Event.prototype,{
  
  next: {value: function(){
    var p = this[path],
        en;
    
    this.parts.unshift(p.pop());
    while(p.length){
      en = 'path ' + p.join('/');
      if(wapp.listeners(en)) return emitter.give(en,this);
      
      this.parts.unshift(p.pop());
    }
    
    emitter.give('rsc',this);
  }}
  
});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"u-su":122,"y-emitter":125,"y-resolver":126,"y-walk":138}],124:[function(require,module,exports){
var Resolver = require('y-resolver'),
    Su = require('u-su'),
    
    yielded = Su();

function toYd(){
  return this[yielded];
}

module.exports = function(){
  var resolver = new Resolver(),
      ret;
  
  ret = [
          function ok(data){
            resolver.accept(data);
          },
          function nok(error){
            resolver.reject(error);
          }
        ];
  
  ret[yielded] = resolver.yielded;
  ret[Resolver.toYielded] = toYd;
  
  return ret;
};


},{"u-su":122,"y-resolver":126}],125:[function(require,module,exports){
var Su = require('u-su'),
    Resolver = require('y-resolver'),
    walk = require('y-walk'),
    
    state = Su(),
    resolver = Su(),
    target = Su(),
    emitter = Su(),
    syn = Su(),
    
    active = Su(),
    
    bag,
    
    Emitter,
    Target,
    Hybrid;

// Emitter

module.exports = Emitter = function Emitter(Constructor){
  Constructor = Constructor || Target;
  this[target] = new Constructor();
  this[target][emitter] = this;
};

Object.defineProperties(Emitter.prototype,bag = {
  
  target: {get: function(){ return this[target]; }},
  
  give: {value: function(event,data){
    var res;
    
    while(this[target][syn].hasOwnProperty(event)) event = this[target][syn][event];
    res = this[target][resolver][event];
    
    if(res && !res.yielded.done){
      delete this[target][resolver][event];
      res.accept(data);
    }
    
  }},
  
  throw: {value: function(event,error){
    var res;
    
    while(this[target][syn].hasOwnProperty(event)) event = this[target][syn][event];
    res = this[target][resolver][event];
    
    if(res && !res.yielded.done){
      delete this[target][resolver][event];
      res.reject(error);
    }
    
  }},
  
  set: {value: function(event,data){
    while(this[target][syn].hasOwnProperty(event)) event = this[target][syn][event];
    (this[target][resolver][event] = this[target][resolver][event] || new Resolver()).accept(data);
  }},
  
  setError: {value: function(event,error){
    while(this[target][syn].hasOwnProperty(event)) event = this[target][syn][event];
    (this[target][resolver][event] = this[target][resolver][event] || new Resolver()).reject(error);
  }},
  
  unset: {value: function(event){
    var res;
    
    while(this[target][syn].hasOwnProperty(event)) event = this[target][syn][event];
    res = this[target][resolver][event];
    
    if(res && res.yielded.done) delete this[target][resolver][event];
  }},
  
  sun: {value: function(state1,state2){
    this.unset(state2);
    this.set(state1);
  }},
  
  syn: {value: function(from,to){
    this[target][syn][from] = to;
  }},
  
  unsyn: {value: function(from){
    delete this[target][syn][from];
  }}
  
});

// Target

function Cbc(){
  this[active] = true;
}

Object.defineProperty(Cbc.prototype,'detach',{value: function(){
  this[active] = false;
}});

function* callOn(cbc,args,event,listener){
  
  args[0] = yield this.until(event);
  while(cbc[active]){
    walk(listener,args,this);
    args[0] = yield this.until(event);
  }
  
}

function* callOnce(cbc,args,event,listener){
  
  args[0] = yield this.until(event);
  if(cbc[active]) walk(listener,args,this);
  
}

Emitter.Target = Target = function Target(prop){
  if(this[emitter]) return;
  
  if(prop){
    this[emitter] = this[prop] = Object.create(Emitter.prototype);
    this[emitter][target] = this;
  }
  
  this[syn] = {};
  this[state] = {};
  this[resolver] = {};
};

Object.defineProperties(Target.prototype,{
  
  walk: {value: function(generator,args){
    walk(generator,args,this);
  }},
  
  until: {value: function(event){
    var res;
    
    while(this[syn].hasOwnProperty(event)) event = this[syn][event];
    
    res = this[resolver][event];
    if(res) return res.yielded;
    
    res = this[resolver][event] = new Resolver();
    this[emitter].give(this.event,event);
    
    return res.yielded;
  }},
  
  listeners: {value: function(event){
    var res;
    
    while(this[syn].hasOwnProperty(event)) event = this[syn][event];
    
    if(res = this[resolver][event]) return res.yielded.listeners.value;
    return 0;
  }},
  
  is: {value: function(event){
    while(this[syn].hasOwnProperty(event)) event = this[syn][event];
    
    return !!(this[resolver][event] && this[resolver][event].yielded.accepted);
  }},
  
  failed: {value: function(event){
    while(this[syn].hasOwnProperty(event)) event = this[syn][event];
    
    return !!(this[resolver][event] && this[resolver][event].yielded.rejected);
  }},
  
  on: {value: function(){
    var event = arguments[0],
        listener = arguments[1],
        cbc = new Cbc();
    
    arguments[1] = cbc;
    walk(callOn,[cbc,arguments,event,listener],this);
    
    return cbc;
  }},
  
  once: {value: function(){
    var event = arguments[0],
        listener = arguments[1],
        cbc = new Cbc();
    
    arguments[1] = cbc;
    walk(callOnce,[cbc,arguments,event,listener],this);
    
    return cbc;
  }},
  
  event: {value: Su()}
  
});

// Hybrid

Emitter.Hybrid = Hybrid = function HybridTarget(){
  this[target] = this;
  this[emitter] = this;
  
  this[syn] = {};
  this[state] = {};
  this[resolver] = {};
};

Hybrid.prototype = new Target();
Hybrid.prototype.constructor = Hybrid;

Object.defineProperties(Hybrid.prototype,bag);

// Auxiliar

Emitter.chain = function(){
  var last = arguments[arguments.length - 1][target],
      i;
  
  arguments[arguments.length - 1][target] = arguments[0][target];
  for(i = 0;i < arguments.length - 2;i++) arguments[i][target] = arguments[i + 1][target];
  arguments[arguments.length - 2][target] = last;
};


},{"u-su":122,"y-resolver":126,"y-walk":138}],126:[function(require,module,exports){
var Su = require('u-su'),
    
    listeners = Su(),
    lSetter = Su(),
    lArgs = Su(),
    
    accepted = Su(),
    rejected = Su(),
    done = Su(),
    value = Su(),
    error = Su(),
    yielded = Su(),
    inited = Su(),
    
    errorTimeout = Su(),
    
    bag,
    
    Resolver,Yielded,Hybrid,Setter,
    tick,isYielded,toYielded;

// Resolver

module.exports = Resolver = function Resolver(Constructor){
  Constructor = Constructor || Yielded;
  this[yielded] = new Constructor();
  this[yielded][inited] = true;
};

Resolver.isYielded = isYielded = '2Alqg4pLDZMZl8Y';
Resolver.toYielded = toYielded = '4siciY0dau6kkit';

Setter = require('y-setter');
tick = require('y-timers/tick');

function throwError(e){
  throw e;
}

function handle(e){
  if(this[accepted]) e.accept(this[value]);
  else e.reject(this[error]);
}

Object.defineProperties(Resolver.prototype,bag = {
  
  yielded: {get: function(){ return this[yielded]; }},
  
  reject: {value: function(e){
    var yd = this[yielded],
        i,cb,args;
    
    if(yd[done]) return;
    
    yd[errorTimeout] = setTimeout(throwError,0,e);
    
    yd[done] = true;
    yd[rejected] = true;
    yd[error] = e;
    
    while(cb = yd[listeners].shift()){
      args = yd[lArgs].shift();
      try{ cb.apply(yd,args); }
      catch(e){ setTimeout(throwError,0,e); }
      yd[lSetter].value--;
    }
    
  }},
  
  accept: {value: function(v){
    var yd = this[yielded],
        i,cb,args;
    
    if(yd[done]) return;
    
    yd[done] = true;
    yd[accepted] = true;
    yd[value] = v;
    
    while(cb = yd[listeners].shift()){
      args = yd[lArgs].shift();
      try{ cb.apply(yd,args); }
      catch(e){ setTimeout(throwError,0,e); }
      yd[lSetter].value--;
    }
    
  }},
  
  bind: {value: function(yd){
    if(yd.done) handle.call(yd,this);
    else yd.listen(handle,[this]);
  }}
  
});

// Yielded

Resolver.Yielded = Yielded = function Yielded(prop){
  if(this[inited]) return;
  
  if(prop){
    this[inited] = true;
    this[prop] = Object.create(Resolver.prototype);
    this[prop][yielded] = this;
  }
  
  this[lSetter] = new Setter();
  this[lSetter].value = 0;
  
  this[listeners] = [];
  this[lArgs] = [];
  
  this[done] = false;
  this[rejected] = false;
  this[accepted] = false;
}

function toPromiseCb(resolve,reject){
  if(this[accepted]) resolve(this[value]);
  else reject(this[error]);
}

function call(f,arg,r,yd){
  var v;
  
  try{
    
    v = f(arg);
    if(v == r.yielded) return r.reject(new TypeError());
    
    try{
      
      if(v && typeof v.then == 'function'){
        
        v.then(function(value){
          r.accept(value);
        },function(error){
          r.reject(error);
        });
        
        return;
      }
      
    }catch(e){ return r.reject(e); }
    
    r.accept(v);
    
  }catch(e){ r.reject(e); }
}

function handleThen(onFulfilled,onRejected,r){
  if(this[accepted]){
    if(typeof onFulfilled == 'function') tick().listen(call,[onFulfilled,this[value],r,this]);
    else r.accept(this[value]);
  }else{
    if(typeof onRejected == 'function') tick().listen(call,[onRejected,this[error],r,this]);
    else r.reject(this[error]);
  }
}

Object.defineProperties(Yielded.prototype,{
  
  listen: {value: function(callback,args){
    this[listeners].push(callback);
    this[lArgs].push(args || []);
    this[lSetter].value++;
  }},
  
  listeners: {get: function(){ return this[lSetter].getter; }},
  
  toPromise: {value: function(){
    var that = this;
    
    if(this[done]){
      if(this[accepted]) return Promise.accept(this[value]);
      return Promise.reject(this[error]);
    }
    
    return new Promise(function(){
      that.listen(toPromiseCb,arguments);
    });
    
  }},
  
  done: {get: function(){ return this[done]; }},
  
  accepted: {get: function(){
    clearTimeout(this[errorTimeout]);
    return this[accepted];
  }},
  
  rejected: {get: function(){
    clearTimeout(this[errorTimeout]);
    return this[rejected];
  }},
  
  error: {get: function(){
    clearTimeout(this[errorTimeout]);
    return this[error];
  }},
  
  value: {get: function(){ return this[value]; }},
  
  then: {value: function(onFulfilled,onRejected){
    var r = new Resolver(),
        that = this;
    
    if(this.done) handleThen.call(this,onFulfilled,onRejected,r);
    else this.listen(handleThen,[onFulfilled,onRejected,r]);
    
    return r.yielded;
  }}
  
});

Object.defineProperty(Yielded.prototype,isYielded,{value: true});

// Hybrid

Resolver.Hybrid = Hybrid = function Hybrid(){
  this[yielded] = this;
  Yielded.call(this);
  
  this[inited] = true;
}

Hybrid.prototype = new Yielded();
Hybrid.prototype.constructor = Hybrid;

Object.defineProperties(Hybrid.prototype,bag);

// Auxiliar functions

Resolver.accept = function(v){
  var resolver = new Resolver();
  
  resolver.accept(v);
  return resolver.yielded;
};

Resolver.reject = function(e){
  var resolver = new Resolver();
  
  resolver.reject(e);
  return resolver.yielded;
};

Resolver.chain = function(){
  var last = arguments[arguments.length - 1][yielded],
      i;
  
  arguments[arguments.length - 1][yielded] = arguments[0][yielded];
  for(i = 0;i < arguments.length - 2;i++) arguments[i][yielded] = arguments[i + 1][yielded];
  arguments[arguments.length - 2][yielded] = last;
};


},{"u-su":122,"y-setter":127,"y-timers/tick":132}],127:[function(require,module,exports){
var Su = require('u-su'),
    
    getter = Su(),
    inited = Su(),
    
    value = Su(),
    change = Su(),
    map = Su(),
    
    Resolver,Setter,Getter,Hybrid,bag;

// Setter

module.exports = Setter = function Setter(Constructor){
  Constructor = Constructor || Getter;
  this[getter] = new Constructor();
  this[getter][inited] = true;
};

Object.defineProperties(Setter.prototype,bag = {
  
  value: {
    set: function(v){
      var pv = this[getter][value],
          res;
      
      this[getter][value] = v;
      if(v != pv){
        res = this[getter][change];
        if(res){
          delete this[getter][change];
          res.accept();
        }
        
        res = this[getter][map][v];
        if(res){
          delete this[getter][map][v];
          res.accept();
        }
      }
    },
    get: function(){
      return this[getter][value];
    }
  },
  
  getter: {get: function(){
    return this[getter];
  }}
  
});

Resolver = require('y-resolver');

// Getter

Setter.Getter = Getter = function Getter(prop){
  if(this[inited]) return;
  
  if(prop){
    this[inited] = true;
    this[prop] = Object.create(Setter.prototype);
    this[prop][getter] = this;
  }
  
  this[map] = {};
};

Object.defineProperties(Getter.prototype,{
  
  value: {
    get: function(){
      return this[value];
    }
  },
  
  change: {value: function(v){
    
    if(arguments.length){
      if(!this[map][v]) this[map][v] = new Resolver();
      return this[map][v].yielded;
    }
    
    if(!this[change]) this[change] = new Resolver();
    return this[change].yielded;
  }}
  
});

// Hybrid

Setter.Hybrid = Hybrid = function Hybrid(){
  this[getter] = this;
  Getter.call(this);
  
  this[inited] = true;
};

Hybrid.prototype = new Getter();
Hybrid.prototype.constructor = Hybrid;

Object.defineProperties(Hybrid.prototype,bag);

// Auxiliar functions

Setter.chain = function(){
  var last = arguments[arguments.length - 1][getter],
      i;
  
  arguments[arguments.length - 1][getter] = arguments[0][getter];
  for(i = 0;i < arguments.length - 2;i++) arguments[i][getter] = arguments[i + 1][getter];
  arguments[arguments.length - 2][getter] = last;
};


},{"u-su":122,"y-resolver":126}],128:[function(require,module,exports){
(function (global){

if(global.requestAnimationFrame || global.webkitRequestAnimationFrame || global.mozRequestAnimationFrame)
  module.exports = require('./frame/normal.js');
else
  module.exports = require('./frame/hacky.js');

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./frame/hacky.js":129,"./frame/normal.js":130}],129:[function(require,module,exports){
var Resolver = require('y-resolver'),
    
    now = require('../now.js'),
    resolver;

function resolve(){
  var rsv = resolver;
  
  resolver = null;
  rsv.accept(now());
}

module.exports = function(){
  
  if(!resolver){
    resolver = new Resolver();
    setTimeout(resolve,16);
  }
  
  return resolver.yielded;
};



},{"../now.js":131,"y-resolver":126}],130:[function(require,module,exports){
(function (global){
var Resolver = require('y-resolver'),

    raf = global.requestAnimationFrame || global.webkitRequestAnimationFrame || global.mozRequestAnimationFrame,
    resolver;

function resolve(ts){
  var rsv = resolver;
  
  resolver = null;
  rsv.accept(ts);
}

module.exports = function(){
  
  if(!resolver){
    resolver = new Resolver();
    raf(resolve);
  }
  
  return resolver.yielded;
};


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"y-resolver":126}],131:[function(require,module,exports){
(function (process,global){
var t0;

if(global.process){
  
  t0 = process.hrtime();
  t0 = t0[0] * 1e3 + t0[1] * 1e-6;
  
  module.exports = function(){
    var t = process.hrtime();
    
    t = t[0] * 1e3 + t[1] * 1e-6;
    return t - t0;
  };
  
}else if(global.performance){
  
  t0 = performance.now();
  
  module.exports = function(){
    return performance.now() - t0;
  };
  
}else{
  
  t0 = Date.now();
  
  module.exports = function(){
    return Date.now() - t0;
  };
  
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":98}],132:[function(require,module,exports){
(function (global){

if(global.setImmediate) module.exports = require('./tick/normal.js');
else module.exports = require('./tick/hacky.js');

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./tick/hacky.js":133,"./tick/normal.js":134}],133:[function(require,module,exports){
var Resolver = require('y-resolver'),
    ticker = new Image(),
    state = true,
    rsvs = [];

ticker.onerror = function(){
  var rs = rsvs.slice(),
      rsv;
  
  rsvs = [];
  while(rsv = rs.shift()) rsv.accept();
};

module.exports = function(){
  var resolver = new Resolver();
  
  rsvs.push(resolver);
  
  if(state) ticker.src = 'data:,0';
  else ticker.src = 'data:,1';
  
  state = !state;
  
  return resolver.yielded;
};


},{"y-resolver":126}],134:[function(require,module,exports){
var Resolver = require('y-resolver');

function resolve(resolver){
  resolver.accept();
}

module.exports = function(t){
  var resolver = new Resolver();
  
  setImmediate(resolve,resolver);
  return resolver.yielded;
};


},{"y-resolver":126}],135:[function(require,module,exports){
(function (global){

if(global.document && global.Worker && global.Blob) module.exports = require('./wait/hacky.js');
else module.exports = require('./wait/normal.js');

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./wait/hacky.js":136,"./wait/normal.js":137}],136:[function(require,module,exports){
var Resolver = require('y-resolver'),
    worker,
    counter = 0,
    resolvers = {};

worker = new Worker(URL.createObjectURL(new Blob([
  'function echo(data){' +
    'postMessage(data);' +
  '}' +
  
  'addEventListener("message",function(e){' +
		'setTimeout(echo,Math.max(e.data[0]-2,0),e.data[1]);' +
	'});'
],{type: 'text/javascript'})));

worker.onmessage = function(e){
  var r = resolvers[e.data];
  
  delete resolvers[e.data];
  r.accept();
};

module.exports = function(t){
  var resolver = new Resolver(),
      id = counter = (counter + 1)%1e15;
  
  resolvers[id] = resolver;
  worker.postMessage([t,id]);
  
  return resolver.yielded;
};


},{"y-resolver":126}],137:[function(require,module,exports){
var Resolver = require('y-resolver');

function resolve(resolver){
  resolver.accept();
}

module.exports = function(t){
  var resolver = new Resolver();
  
  setTimeout(resolve,Math.max(t - 1,0),resolver);
  return resolver.yielded;
};


},{"y-resolver":126}],138:[function(require,module,exports){
var Resolver = require('y-resolver'),
    Su = require('u-su'),
    
    stack = [],
    toYd = Resolver.toYielded,
    isYd = Resolver.isYielded,
    
    walk;

// Main

function getYielded(obj){
  
  while(!(obj && obj[isYd])){
    if(obj instanceof Object && obj[toYd]) obj = obj[toYd]();
    else return Resolver.accept(obj);
  }
  
  return obj;
}

walk = module.exports = function(generator,args,thisArg){
  return walkIt(generator,args,thisArg,stack);
};

function squeeze(iterator,prevYd,resolver,s){
  var result,res,error,prevStack;
  
  while(true){
    
    if(!prevYd.done){
      prevYd.listen(squeeze,[iterator,prevYd,resolver,s]);
      return;
    }
    
    prevStack = stack;
    stack = s;
    
    try{
      if(prevYd.accepted) result = iterator.next(prevYd.value);
      else result = iterator.throw(prevYd.error);
    }catch(e){ error = e; }
    
    stack = prevStack;
    
    if(error) return resolver.reject(error);
    if(result.done) return resolver.accept(result.value);
    
    try{ prevYd = getYielded(result.value); }
    catch(e){ return resolver.reject(e); }
  }
  
}

function walkIt(generator,args,thisArg,s){
  var it,result,resolver,prevYd,res,error,prevStack;
  
  prevStack = stack;
  stack = s;
  
  try{ it = generator.apply(thisArg || this,args); }
  catch(e){
    stack = prevStack;
    return Resolver.reject(e);
  }
  
  if(!(it && it.next && it.throw)){
    stack = prevStack;
    return Resolver.accept(it);
  }
  
  try{ result = it.next(); }
  catch(e){ error = e; }
  
  stack = prevStack;
  
  if(error) return Resolver.reject(error);
  if(result.done) return Resolver.accept(result.value);
  
  try{ prevYd = getYielded(result.value); }
  catch(e){ return Resolver.reject(e); }
  
  resolver = new Resolver();
  squeeze(it,prevYd,resolver,s);
  
  return resolver.yielded;
}

// Aux

walk.trace = function(id,generator,args,thisArg){
  var s = stack.slice();
  s.push(id);
  
  return walkIt(generator,args,thisArg,s);
};

walk.getStack = function(){
  return stack.slice();
};

walk.wrap = function(generator){
  return function(){
    return walk(generator,arguments,this);
  };
};

require('./main/proto.js');

},{"./main/proto.js":139,"u-su":122,"y-resolver":126}],139:[function(require,module,exports){
(function (global){
var Resolver = require('y-resolver'),
    Su = require('u-su'),
    walk = require('../main.js'),
    
    yielded = Su(),
    
    toYd = Resolver.toYielded,
    
    race,fromPromise,run;

// Promise

if(global.Promise && !Promise.prototype[toYd])
Object.defineProperty(Promise.prototype,toYd,{writable: true,value: fromPromise = function(){
  var resolver;
  
  if(this[yielded]) return this[yielded];
  
  resolver = new Resolver();
  this.then(function(v){ resolver.accept(v); },function(e){ resolver.reject(e); });
  
  return this[yielded] = resolver.yielded;
}});

// Array (Promise.all equivalent)

if(!Array.prototype[toYd]){
  
  run = walk.wrap(function*(ctx,i,yd){
    var error;
    
    try{
      ctx.arr[i] = yield yd;
      if(!--ctx.length) ctx.resolver.accept(ctx.arr);
    }catch(e){
      ctx.errors[i] = e;
      if(!--ctx.length){
        error = new Error(e.message);
        error.stack = e.stack;
        
        error.errors = ctx.errors;
        error.values = ctx.arr;
        
        ctx.resolver.reject(error);
      }
    }
    
  });
  
  Object.defineProperty(Array.prototype,toYd,{writable: true,value: function(){
    var arr = [],
        res,i,ctx;
    
    if(!this.length) return Resolver.accept(arr);
    
    ctx = {
      length: this.length,
      resolver: new Resolver(),
      arr: [],
      errors: []
    };
    
    for(i = 0;i < this.length;i++) run(ctx,i,this[i]);
    
    return ctx.resolver.yielded;
  }});
  
}

// Object (Promise.race equivalent)

if(!Object.prototype[toYd]){
  
  race = walk.wrap(function*(ctx,key,yd){
    var error;
    
    try{
      ctx.obj[key] = yield yd;
      ctx.resolver.accept(ctx.obj);
    }catch(e){
      ctx.errors[key] = e;
      if(!--ctx.toFail){
        error = new Error(e.message);
        error.stack = e.stack;
        
        error.errors = ctx.errors;
        ctx.resolver.reject(error);
      }
    }
    
  });
  
  Object.defineProperty(Object.prototype,toYd,{writable: true,value: function(){
    var keys,ctx,i;
    
    if(typeof this.toPromise == 'function') return this.toPromise();
    if(typeof this.then == 'function') return fromPromise.call(this);
    
    keys = Object.keys(this);
    if(!keys.length) return Resolver.accept(this);
    
    ctx = {
      resolver: new Resolver(),
      toFail: keys.length,
      errors: {},
      obj: {}
    };
    
    for(i = 0;i < keys.length;i++) race(ctx,keys[i],this[keys[i]]);
    
    return ctx.resolver.yielded;
  }});
  
}



}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../main.js":138,"u-su":122,"y-resolver":126}]},{},[10]);
