/*
  FENIX Catalog Bridge Factory

  The component create different instance FENIX Catalog Bridge.
  In order to let live in the same context different instances of the Bridge,
  please define as option the 'id' parameter.

  e.g.
    var factory   = new fenix_catalog_bridge_factory();
    var myBridge  = factory.create({id : 'mycustomid'})
*/
(function(){

window.Fenix_catalog_bridge_factory = function(){

  console.log('--- NEW Bridge Factory creation');

  Fenix_catalog_bridge_factory.prototype.createBridge = function( options ) {
    console.log('--- NEW Bridge creation with id: '+ options.id);
    return new Fenix_catalog_bridge( options );
  
  };

}

window.Fenix_catalog_bridge = function( options ) {

  var o = { };
  //Default Catalog options
  var defaultOptions = { };

  function init( options ){

    //Merge options
    extend(o, defaultOptions);
    extend(o, options);
    
  }

  function actionOneHandler(src, target){
    console.log('*** BRIDGE Performing action 1');

    var pluginSrc = window.fenix_catalog_bridge_plugins[src.getOption('name')];
    pluginSrc.init({component : src});

    var pluginTarger = window.fenix_catalog_bridge_plugins[target.getOption('name')];
    pluginTarger.init({component : target});

    pluginTarger.handler(pluginSrc.getOption("payload"));
  
  }

  function actionTwoHandler(src, callback){
    console.log('*** BRIDGE Performing action 2');
    
    var plugin = window.fenix_catalog_bridge_plugins[src.getOption('name')];
    plugin.init({component : src});

    var str = plugin.getOption('param');
    callback( str.replace(/\s+/g, '') );
  
  }

  //Initialize the instance of the Catalog bridge
  init( options );

  return { 
    actionOneHandler : actionOneHandler,
    actionTwoHandler : actionTwoHandler
  }

}

})();