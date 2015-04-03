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
