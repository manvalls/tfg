var Animation = require('u-css/animation'),
    Class = require('u-css/class'),
    elem = require('u-elem'),
    
    loadAnim = new Animation(),
    loadClass = new Class(),
    loading;


loadAnim.set('from, to',{
  opacity: 0.6
});

loadAnim.set('50%',{
  opacity: 1
});

loadClass.apply({
  animationDuration: '1.5s',
  animationName: loadAnim,
  animationIterationCount: 'infinite',
  
  backgroundColor: '#252525',
  width: '20px',
  height: '20px',
  margin: '5px',
  borderRadius: '2px'
});

loading = module.exports = elem(['div',
  {
    style: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      
      position: 'absolute',
      zIndex: 2,
      backgroundColor: 'white',
      
      top: '0px',
      left: '0px',
      
      width: '100%',
      height: '100%'
    }
  },
  ['div',
    {
      className: loadClass,
    }
  ],
  ['div',
    {
      className: loadClass,
      style: {
        animationDelay: '-250ms'
      }
    }
  ],
  ['div',
    {
      className: loadClass,
      style: {
        animationDelay: '-500ms'
      }
    }
  ]
]);
