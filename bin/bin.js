var help = require('u-help'),
    cp = require('child_process'),
    
    i,port,server;

i = process.argv.indexOf('--help');

if(i != -1){
  
  help.show('manvalls-tfg [<opciones>]',{
    Opciones: {
      '-p <puerto>':  'Puerto en el que el servidor escuchará, por defecto 8080',
      '--forever':    'Lanzar el servidor usando forever',
      '-n':           'Imprime el nombre del script a ejecutar por `forever` y finaliza'
    }
  });
  
  return;
}

i = process.argv.indexOf('-n');
if(i != -1){
  console.log(__dirname + '/launch.js');
  return;
}

i = process.argv.indexOf('-p');

if(i == -1) port = 8080;
else port = process.argv[i + 1];

i = process.argv.indexOf('--forever');

if(i == -1) cp.fork(__dirname + '/launch.js',[port]);
else cp.fork(require.resolve('forever/bin/forever'),[
  'start',
  '--minUptime',
  1000,
  '--spinSleepTime',
  10000,
  '-c',
  'node --harmony',
  __dirname + '/launch.js',
  port
]);

