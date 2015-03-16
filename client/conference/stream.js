var Pair = require('y-callback/pair'),
    Resolver = require('y-resolver'),
    
    pair;

navigator.getUserMedia =  navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia;

if(navigator.getUserMedia){
  module.exports = pair = Pair();
  navigator.getUserMedia({audio: true},pair[0],pair[1]);
}else module.exports = Resolver.reject();

