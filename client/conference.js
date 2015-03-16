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
    
    margin: '50px'
  }}
]);

conf.appendChild(peerCont);

// Distortion

dist = elem(['input',{
  type: 'range',
  min: 0,
  max: 1,
  step: 0.001,
  width: '200px'
}]);

localStorage.distortion = localStorage.distortion || 0;
Core.setDistortion(parseFloat(dist.value = localStorage.distortion));

dist[on]('input',function(){
  Core.setDistortion(parseFloat(localStorage.distortion = dist.value));
});

elem([conf,['div','Distorsión:',{style: {fontFamily: font,fontSize: 'large',margin: '3px'}}],dist]);

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

