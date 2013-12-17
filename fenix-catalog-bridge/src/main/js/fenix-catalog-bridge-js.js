function fenix_catalog_bridge( options ) {

  var o = { },
      // Storage for actions that catalog performs
      actions = {
        'action-1' : { handler : actionOneHandler },
        'action-2' : { handler : actionTwoHandler }
      };

  //Default Catalog options
  var defaultOptions = {
    event_plugin_reg_request  : 'registerme.'+ options.id +'.catalog.fenix',
    event_plugin_perform      : 'perform.'+ options.id +'.catalog.fenix'
  };

  function init( options ){

    //Merge options
    extend(o, defaultOptions);
    extend(o, options);

    //Listeners
    initEventListeners();
    
  };

  function initEventListeners(){

    /* Components registration listener*/
    document.body.addEventListener(o.event_plugin_reg_request, function(event){
      console.log('*** Registration of '+ event.detail.component.name+' successfull')
      subscribe(event.detail.actions, event.detail.component)
    }, false);

    /* Components registration listener*/
    document.body.addEventListener(o.event_plugin_perform, function(event){
      console.log('*** Performing '+ event.detail.action+' for '+event.detail.component.name)
      perform(event.detail.action, event.detail.component, event.detail.payload)
    }, false);

  };

  /*## For subscription and Action Performing */
  /* Subscribe component to a set of actions */
  function subscribe(as, c ){

    for (var i=0; i < as.length; i++){
      if ( actions[as[i]] ){
        if (!actions[as[i]].subscribers){ actions[as[i]].subscribers = {} };
        actions[as[i]].subscribers[c.name] = c; 
      }
    }
  
  };

  /* @params action and component */
  function perform(a, c, p){

    console.log('*** Performing of "'+a+'" by '+c.name)
    /* Exit if action does not exist or component is not subscribed to it*/  
    if ( !actions[a] ){ return false; }
    if ( !actions[a].subscribers[c.name]){ return false;}
    actions[a].handler( actions[a].subscribers[c.name], p);
  
  };

  /*## Action Callback implementations */
  function actionOneHandler(c, p){
    console.log('*** Performing action 1 callback fn with payload') 
    console.log(p)
    /*
    I can do whatever if want here.
    request translation via JSONtranslator-js
    retrieve data from server

    At the end call 
    */
    
    /*
    Every component that is subscribed to a certain action has to implement an 'interface'
    with certain public methos. It has to be a standard of the component that use the bridge
    */
    var fetcheddata = 'my fetched data 1'
    c.standardcallback(fetcheddata)
  
  };

  function actionTwoHandler(c, p){
    
    console.log('*** Performing action 2 callback fn with payload')   
    var fetcheddata = 'my fetched data 2'
    c.standardcallbackTwo(fetcheddata)
  
  };

  //Initialize the instance of the Catalog bridge
  init( options );

  return { perform : perform }

};

/*
  FENIX Catalog Bridge Factory

  The component create different instance FENIX Catalog Bridge.
  In order to let live in the same context different instances of the Bridge,
  please define as option the 'id' parameter.

  e.g.
    var factory   = new fenix_catalog_bridge_factory();
    var myBridge  = factory.create({id : 'mycustomid'})
*/
function fenix_catalog_bridge_factory(){

  console.log('--- NEW Bridge Factory creation')

  fenix_catalog_bridge_factory.prototype.createBridge = function( options ) {
    console.log('--- NEW Bridge creation with id: '+options.id)
    return new fenix_catalog_bridge( options );
  };

};