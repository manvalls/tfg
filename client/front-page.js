var elem = require('u-elem'),
    wapp = require('wapp/client'),
    
    on = require('u-proto/on'),
    
    font = require('./font.js'),
    
    active = true,
    container,input;

module.exports = container = elem(['div',
  {
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
  }
]);

Object.defineProperty(container,'active',{
  
  get: function(){
    return active;
  },
  
  set: function(v){
    v = !!v;
    
    if(active == v) return;
    active = v;
    
    if(active){
      container.style.right = '0%';
      input.focus();
    }else{
      container.style.right = '100%';
      input.blur();
    }
  }
  
});

container.appendChild(elem(['div',
  'Nombre de la conferencia:',
  {
    style: {
      fontFamily: font,
      fontSize: '200%'
    }
  }
]));

input = elem(['input',
  {
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
  }
]);

container.appendChild(input);

window[on]('keydown',function(e){
  if(!active) return;
  if(e.keyCode == 13) wapp.goTo(input.value);
  else input.focus();
});


