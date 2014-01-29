(function(){

/* PRODUCER */
window.fenix_component_producer = function(){

  var o = { },
      //Default Catalog options Options
      defaultOptions = {
        name        : 'fenix_component_producer',
        param       : 'You should see me without space',
        payload     : 'PAYLOAD'
      };

  function init( baseOptions ){

    //Merge options
    extend(o, defaultOptions);
    extend(o, baseOptions);
 
  }

  function fakeFnOne(){ 
    raiseCustomEvent(document.body, 'perform.fakefnone.producer.fenix',  { payload   : "this is my custom payload" });
  }

  function fakeFnTwo(){
    raiseCustomEvent(document.body, 'perform.fakefntwo.producer.fenix',  { payload   : "this is my custom payload" });
  }

  /*PLUGINS SECTION*/
  function manualPluginsRegistation(){

      /*
      raiseCustomEvent(document.body, o.e_prefix_reg + o.catalog + o.e_suffix, 
      { actions   : o.actions,
        component : fenix_catalog_component });
      */

  }

      //Public methods
      return { getOption          : function( option ){ return o[option]; },
               init               : init,
               fakeFnOne          : fakeFnOne,
               fakeFnTwo          : fakeFnTwo
              }

};

//FENIX Catalog Producer Plugin registration
if(!window.fenix_catalog_bridge_plugins) window.fenix_catalog_bridge_plugins = {};
window.fenix_catalog_bridge_plugins['fenix_component_producer'] =  (function() {

  var o = { },
      //Default Catalog options Options
      defaultOptions = {
        name          : 'fenix_component_producer_plugin',
        component_name: 'fenix_component_producer'
      };

  function init( baseOptions ){

    //Merge options
    extend(o, defaultOptions);
    extend(o, baseOptions);
 
  }

  function getOption( option ){  return o.component.getOption(option) }

  return {
            init      : init,
            getOption : getOption
          };

})();




/* CONSUMER */
window.fenix_component_consumer = function() {

  var o = { },
      //Default Catalog options Options
      defaultOptions = {
        name        : 'fenix_component_consumer'
      };

  function init( baseOptions ){

    //Merge options
    extend(o, defaultOptions);
    extend(o, baseOptions);
 
  }

  function handler( payload ){
    console.log('@@@ CONSUMER handler with payload '+ payload)
  }

  //Public methods
  return { getOption          : function( option ){return o[option];},
           init               : init,
           handler            : handler
          }

};

//FENIX Catalog Consumer Plugin Registration
if(!window.fenix_catalog_bridge_plugins) window.fenix_catalog_bridge_plugins = {};
window.fenix_catalog_bridge_plugins['fenix_component_consumer'] = (function() {

  var o = { },
      //Default Catalog options Options
      defaultOptions = {
        name          : 'fenix_component_consumer_plugin',
        component_name: 'fenix_component_consumer'
      };

  function init( baseOptions ){

    //Merge options
    extend(o, defaultOptions);
    extend(o, baseOptions);
 
  }

  function handler( payload ){

    return o.component.handler( payload )
  
  }

  return {
            init      : init,
            handler   : handler
          };

})();

})();