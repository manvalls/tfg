# Implementación de un servicio de multiconferencia P2P

## Introducción

## Tecnologías

Con el fin de realizar el proyecto propuesto se ha decido emplear el siguiente conjunto de tecnologías, primando estándares y herramientas abiertas frente a alternativas propietarias:

### HTML5

Con origen en el CERN, HTML ha evolucionado hasta convertirse en el lenguaje de marcado *de facto* de la web, aumentando su relevancia a la par que lo hace la variedad de terminales orientados al usuario final, siendo una elección recurrente a la hora de desarrollar aplicaciones multiplataforma.

Su última iteración, HTML5, introduce nuevos elementos que nos permiten redefinir el concepto de *aplicación web*, creando experiencias interactivas que van más allá del hipertexto.

### CSS3

Y si HTML se ha convertido en el lenguaje de marcado por excelencia de la web, CSS conforma el conjunto de reglas y estilos que nos permiten controlar la apariencia de los contenidos descritos en el documento HTML. De esta forma, cosas como el elemento `font` fueron paulatinamente desapareciendo de HTML para ceder el control a CSS, restringiendo las competencias de HTML a lo puramente semántico.

Con CSS3 la especificación se modulariza, desarrollando en paralelo cada una de las diferentes secciones y permitiendo aplicar rotaciones, transiciones e incluso complejos efectos de imagen.

### ECMAScript 6

Para completar el conjunto de tecnologías que permitan la creación de efectivas aplicaciones web se hace necesaria la incorporación de un tercer elemento: un lenguaje de programación. JavaScript hizo su aparición por primera vez en el navegador Netscape como una alternativa para *amateurs* a Java, el lenguaje de moda del momento.

Pese a que su soporte en navegadores nació prácticamente ligado al de Java, la popularidad del primero acabó eclipsando a la del segundo, a tal punto que hoy en día la presencia de las *Java applets* queda reducida a tareas computacionalmente intensivas, a menudo en webs compuestas en la era pre-HTML5.

ECMAScript, el nombre del lenguaje estandarizado por Ecma International detrás de JavaScript, es un lenguaje interpretado, dinámicamente tipado y basado en prototipos, además de otras características. En sus inicios, la misma hebra encargada de procesar JavaScript manejaba tanto HTML y CSS como la propia interfaz del navegador.

Como consecuencia, un script cuya ejecución durara varios segundos mantenía el resto del navegador bloqueado, a la espera de que el script finalizara. En un escenario como este, cosas como un simple `sleep` aparecen como inviables, pues dejarían el navegador inutilizado durante un tiempo apreciable, resultando en una experiencia de usuario nada agradable.

JavaScript evolucionó para adaptarse a estas limitaciones con el objetivo de limitar al máximo el tiempo de ejecución de cada llamada a funciones, convirtiéndose en la práctica en un lenguaje fuertemente asíncrono, aprovechando el concepto de *callbacks*. Tómese el siguiente código de ejemplo:

```javascript
console.log('hola');

setTimeout(function(){
  console.log('qué hay');
},1000);

console.log('mundo');
```

Este código de ejemplo se leería:

```
Imprime "hola\n"
Dentro de 1000ms imprime "qué hay\n"
Imprime "mundo\n"
```

Produciendo la siguiente salida:

```
hola
mundo
qué hay
```

De esta forma la ejecución del script es inmediata, permitiendo al navegador realizar otras tareas para, pasados 1000ms, ejecutar el código indicado. Esta arquitectura, aunque sorprendentemente eficiente para tareas como la lectura de ficheros, aumenta considerablemente la dificultad del control de flujo, además de afear el código abriendo las puertas al temido *callback hell*:

```javascript
console.log('Lorem');

setTimeout(function(){
  console.log('dolor');
  setTimeout(function(){
    console.log('sit');
    setTimeout(function(){
      console.log('amet');
    },1000);
  },1000);
},1000);

console.log('ipsum');
```

ECMAScript 6, de reciente aparición, introduce una nueva estructura que se ha convertido en la solución definitiva para el control de flujo en operaciones asíncronas dentro de JavaScript: las funciones generadoras. Con las herramientas adecuadas y un pequeño *setup*, el código anterior puede reescribirse de la siguiente manera:

```javascript
console.log('Lorem');

walk(function*(){
  yield wait(1000);
  console.log('dolor');
  yield wait(1000);
  console.log('sit');
  yield wait(1000);
  console.log('amet');
});

console.log('ipsum');
```

Debemos evitar pensar en JavaScript como un lenguaje concurrente: cada script se ejecuta en una sola hebra y *del tirón*. Antes de la aparición de las funciones generadoras, esto significaba que los callbacks no podían superponerse unos a otros: si planificamos la ejecución de dos callbacks distintos dentro de 500ms, primero se ejecutará uno y a continuación el siguiente.

Con la introducción de ECMAScript 6 a lo anterior hay que añadir que, dentro de una función generadora, solo se puede romper la ejecución al alcanzar la palabra clave `yield`. Así, a pesar de tener la ilusión de estar trabajando con un código síncrono, la ejecución es efectivamente asíncrona, dejando tiempo al navegador para ocuparse de otras tareas.

### HTTP/1.1

Ya tenemos el lenguaje de marcado, los estilos y el lenguaje de programación, solo resta establecer el protocolo de transporte. HTTP y su modelo petición - respuesta, cimentado sobre TCP, aparece como el protocolo ideal para la transmisión fiable de los datos que componen el código de nuestra aplicación web: texto.

A pesar de la aparición de nuevas variantes como SPDY o HTTP/2, el conjunto de métodos y la sintáxis del mensaje se mantiene invariante desde HTTP/1.1, con las nuevas mejoras centrándose en los métodos de transporte del mensaje. Esto nos permite trabajar sobre HTTP/1.1 sin renunciar a los avances introducidos en SPDY y HTTP/2, ya que una simple actualización de la librería subyacente basta para aprovechar prácticamente al máximo estas nuevas versiones.

### WebSockets



### WebRTC 1.0

### Web Audio API

### node.js

### Soporte en navegadores

## Desarrollo

### Esquema de funcionamiento

### Arquitectura de la aplicación

#### Librerías vertebrales

##### wapp

##### iku-hub

#### Cliente

#### Servidor

### Distorsión de audio

### Visionado de la Transformada de Fourier del audio procesado

## Conclusiones

## Bibliografía

