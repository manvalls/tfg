var wapp = require('wapp/client'),

    on = require('u-proto/on'),
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

window[on]('resize',function(){
  
  document.body.style[apply]({
    width: window.innerWidth + 'px',
    height: window.innerHeight + 'px'
  });
  
});

document.body.appendChild(frontPage);
document.body.appendChild(conference);

wapp.on('rsc',function(e){
  
  if(e.rsc == ''){
    frontPage.active = true;
    conference.active = false;
  }else{
    frontPage.active = false;
    conference.active = true;
    conference.name = e.rsc;
  }
  
});

