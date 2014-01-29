/* FENIX Catalog Data sets Component */
(function() {

    window.fenix_catalog_datasets = function(){

    var o = { },
    //Default Catalog options Options
        defaultOptions = {
            name        : 'fenix_catalog_datasets',
            autorender  : true,
            //events
            e_getdatasets : "getdatasets.fenix_catalog_datasets.catalog.fenix",
            //config
            f_fragments : "html/fenix-catalog-datasets-fragments.html",
            json_config : "json/fenix-catalog-datasets-config.json"
        };

    var $container;

    function init( baseOptions ){

        //Merge options
        extend(o, defaultOptions);
        extend(o, baseOptions);

        if (o.autorender) render( {} );

    }

    function render( options ){

        extend(o, options);
        validateOptions();

        $container = $(o.container);

        $.get(o.f_fragments, function( fragments ){
            $.getJSON(o.json_config, function( json ){

                console.log( json )

            });
        }).error(function(){ alert("Impossible to get fragments for "+ o.name)});

    }

    function validateOptions(){

        //Validate HTML Container
        if ( $(o.container).length === 0 ) alert('Please specify a valid HTML container to render '+ o.name);

    }

    function getDataSets(){
        raiseCustomEvent(document.body, o.e_getdatasets,  { payload   : "this is my custom payload" });
    }

    //Public API
    return { getOption     : function( option ){ return o[option]; },
        init               : init,
        render             : render
    }

    }

})();

//FENIX Catalog Data sets Component Plugin registration
if(!window.fenix_catalog_bridge_plugins) window.fenix_catalog_bridge_plugins = {};
window.fenix_catalog_bridge_plugins['fenix_catalog_datasets'] =  (function() {

    var o = { },
    //Default Catalog options Options
        defaultOptions = {
            name          : 'fenix_catalog_datasets_plugin',
            component_name: 'fenix_catalog_datasets'
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