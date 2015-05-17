var Wapp = require('wapp'),
    WsPm = require('i-pm/ws'),
    Server = require('iku-hub/server'),
    Room = Server.Room,
    wrap = require('y-walk').wrap;

function onReq(req){
  req.answer('default','es');
}

function* onClient(client,c,rooms){
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

module.exports = function(server,path){
  var app,hp,hub,rooms;
  
  app = new Wapp(server,{
    path: path,
    client: __dirname + '/client'
  });
  
  hp = (path || '') + '/.hub',
  hub = new Server(WsPm(server,hp)),
  rooms = {};
  
  app.on('request',onReq);
  hub.on('client',onClient,rooms);
};

