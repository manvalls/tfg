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
    
    Peer;

function onRangeInput(e,cbc,audio){
  audio.volume = parseFloat(this.value);
}

Peer = module.exports = function Peer(audio){
  var range,i;
  
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
  
  if(audio){
    
    range = elem(['input',{
      type: 'range',
      className: rangeClass,
      min: 0,
      max: 1,
      step: 0.01
    }]);
    
    this.container.appendChild(range);
    
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

