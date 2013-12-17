var fenix_catalog_component = (function() {

  var o = { },
      //Default Catalog options Options
      defaultOptions = {
        actions     :  ['action-1', 'action-2'],
        name        : 'fenix_catalog_component'
      };

  function init( baseOptions ){

    /*MOVE FROM HERE!!!!*/
    o['event_plugin_reg_request'] = 'registerme.'+ baseOptions.catalog +'.catalog.fenix';

    //Merge options
    extend(o, defaultOptions);
    extend(o, baseOptions);

    raiseCustomEvent(document.body, o.event_plugin_reg_request, 
      { actions   : o.actions,
        component : fenix_catalog_component });
 
  };

  /*  function initEventListeners(){

  };*/

  function standardcallback( payload ){
    console.log('@@@ callback 1 component with payload '+ payload)
  }

  function standardcallbackTwo( payload ){
    console.log('@@@ callback 2 component with payload '+ payload)
  }

  //Public methods
  return { name             : 'fenix_catalog_component',
           init             : init,
           standardcallback : standardcallback,
           standardcallbackTwo : standardcallbackTwo
          }

})();