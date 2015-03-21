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

function onRangeInput(e,cbc,audio){
  audio.volume = parseFloat(this.value);
}

Peer = module.exports = function Peer(audio){
  var range,i,markers;
  
  this.container = elem(['div',{className: contClass}]);
  
  this[fft] = {};
  
  this[fft].container = elem(['div',{className: fftClass},
    this[fft].barContainer = elem(['div',{style: {height: barHeight + 'px'}}]),
    this[fft].line = elem(['div',{style: {height: height - barHeight + 'px', position: 'relative'}}])
  ]);
  
  this[fft].bars = [];
  for(i = 0;i < fftSize;i++){
    
    this[fft].bars[i] = elem(['div',{
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
  
  markers = elem(['div',{style: {fontFamily: font, position: 'relative'}}]);
  this.container.appendChild(markers);
  
  elem([markers,['span',
    '0',
    {style: {
      position: 'absolute',
      top: '0%',
      left: '0%'
    }}],
    ['div',{style: {
      backgroundColor: 'black',
      width: '1px',
      height: '6px',
      position: 'absolute',
      top: '-2px',
      left: '2px'
    }}]
  ]);
  
  elem([markers,['span',
    Math.round(ctx.sampleRate * 10 / 1000 / 4 / 2) / 10,
    {style: {
      position: 'absolute',
      width: '30px',
      textAlign: 'center',
      top: '0%',
      left: (width + 4) / 2 - 15 + 'px'
    }}],
    ['div',{style: {
      backgroundColor: 'black',
      width: '1px',
      height: '6px',
      position: 'absolute',
      top: '-2px',
      left: '50%'
    }}]
  ]);
  
  elem([markers,['span',
    Math.round(ctx.sampleRate * 10 / 1000 / 4) / 10,
    {style: {
      position: 'absolute',
      top: '0%',
      right: '0%'
    }}],
    ['div',{style: {
      backgroundColor: 'black',
      width: '1px',
      height: '6px',
      position: 'absolute',
      top: '-2px',
      right: '2px'
    }}]
  ]);
  
  elem([this.container,['br'],['div','kHz',{style: {fontFamily: font, textAlign: 'center'}}]]);
  
  if(audio){
    
    range = elem(['input',{
      type: 'range',
      className: rangeClass,
      min: 0,
      max: 1,
      step: 0.01
    }]);
    
    elem([this.container,['div','Volumen:',{style: {
      textAlign: 'center',
      fontFamily: font,
      marginTop: '2px'
    }}],range]);
    
    range.value = audio.volume;
    range[on]('input',onRangeInput,audio);
    
  }
  
};

Peer.prototype.setColor = function(color){
  this[fft].line.style.backgroundColor = colors[color][0];
  this[fft].barContainer.style.backgroundColor = colors[color][1];
};

Peer.prototype.setFFT = function(fftData){
  var i;
  
  for(i = 0;i < fftSize;i++){
    this[fft].bars[i].style.height = fftData[i] * barHeight / 255 + 'px';
  }
  
};

