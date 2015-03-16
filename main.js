var Wapp = require('wapp'),
    Server = require('iku-hub/server/ws'),
    Room = require('iku-hub/server').Room,
    wrap = require('y-walk').wrap;

function onReq(req){
  
  req.answer(
    'Trabajo Fin de Grado - Manuel Valls Fernández',
    'Servicio de Multiconferencia P2P haciendo uso del estándar WebRTC 1.0'
  );
  
}

function* onClient(client,en,rooms){
  var name = yield client.until('msg');
  
  if(!rooms[name]){
    rooms[name] = new Room();
    rooms[name].add(client);
    rooms[name].once('empty',cleanRoom,rooms,name);
  }else rooms[name].add(client);
  
}

function cleanRoom(e,en,rooms,name){
  delete rooms[name];
}

module.exports = wrap(function*(server,path){
  var app,hp,hub,rooms;
  
  path = path || '/';
  if(path.charAt(0) != '/') path = '/' + path;
  if(path.charAt(path.length - 1) != '/') path += '/';
  
  app = yield Wapp(__dirname + '/client',server,path),
  hp = path + '.hub',
  hub = new Server(server,hp),
  rooms = {};
  
  app.on('request',onReq);
  hub.on('client',onClient,rooms);
});

