var port = process.argv[2] || 8080,
    server = require('http').createServer().listen(port);

require('../main.js')(server);
server.on('listening',function(){
  console.log('Escuchando en el puerto ' + port);
});

