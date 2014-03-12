/*
  FENIX Catalog Bridge Factory

  The component create different instance FENIX Catalog Bridge.
  In order to let live in the same context different instances of the Bridge,
  please define as option the 'id' parameter.

  e.g.
    var factory   = new Fenix_catalog_bridge_factory();
    var myBridge  = factory.createBridge({id : 'mycustomid', ...})
*/
(function(){
"use strict";

window.Fenix_catalog_bridge_factory = function(){

  Fenix_catalog_bridge_factory.prototype.createBridge = function( options ) {
    return new Fenix_catalog_bridge( options );
  };

}

window.Fenix_catalog_bridge = function( options ) {

  var   o = { },
        defaultOptions = {
            error_prefix : "Fenix_catalog_bridge ERROR: "
        };

  function init( options ){

    //Merge options
    extend(o, defaultOptions);
    extend(o, options);
    
  }

  function query(src, callback){

      var plugin;

      if (!src || typeof src.getOption !== "function"){
          throw new Error(o.error_prefix + " query() first parameter has to be a valid FENIX Catalog component.")
      }

      if ( !window.Fenix_catalog_bridge_plugins || typeof window.Fenix_catalog_bridge_plugins !== "object"){
          throw new Error(o.error_prefix + " Fenix_catalog_bridge_plugins plugins repository not valid.");
      } else {
          plugin = window.Fenix_catalog_bridge_plugins[src.getOption('name')];
      }

      if (!plugin) { throw new Error(o.error_prefix + " plugin not found.") };

      if (typeof plugin.init !== "function") {
          throw new Error(o.error_prefix + " plugin for "+src.getOption('name')+" does now a public init method.");
      } else {
          plugin.init( {component : src} );
      }

      if (typeof callback !== "function") {
          throw new Error(o.error_prefix + " callback param is not a function");
      } else {
          callback( plugin.getFilter() );
      }

  }

  //Initialize the instance of the Catalog bridge
  init( options );

  return {
    query  : query
  }

}

})();