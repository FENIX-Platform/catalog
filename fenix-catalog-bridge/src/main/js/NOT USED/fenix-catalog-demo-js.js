/* FENIX Catalog Datasets Component */
(function() {
"use strict";

window.Fenix_catalog_demo = function(){

    var o = { },
        //Default Catalog options Options
        defaultOptions = {
            name        : 'fenix_catalog_demo',
            autorender  : true,
            error_prefix: "Fenix_catalog_demo ERROR: "
        },
        uiCreator;

    function init( baseOptions ){

        //Merge options
        extend(o, defaultOptions);
        extend(o, baseOptions);

        if (o.autorender) render();

    }

    function validateOptions(){

        //Validate HTML Container
        if ( $(o.container).length === 0 ) { throw new Error(o.error_prefix + 'invalid HTML container to render '+ o.name) };

    }

    function render( options ){

        if (options) { extend(o, options); }
        validateOptions();

        $.getJSON(o.config, function( json ){

            //Init FENIX UI creator
            if ( window.Fenix_ui_creator && typeof window.Fenix_ui_creator === "function"){

                uiCreator = Fenix_ui_creator();
                uiCreator.render({
                    cssClass  : "form-elements",
                    container : o.container,
                    elements  : JSON.stringify(json.fields),
                    validators: o.validators
                });

            } else {
                throw new Error(o.error_prefix + "please import Fenix_ui_creator JS library.")
            }

        });
    }



    function getValues( validation ){

        try { return uiCreator.getValues( validation ); }
        catch( e ){

            handleFailingValidation( e );
            throw new Error(o.error_prefix + " VALIDATION_ERROR");

        }
    }

    function handleFailingValidation( errors ){

        //TODO implement graphic feedback
        console.log("ERRORS ARE PRESENT!!!!!!")
        console.log(errors)
    }

    //Public API
    return { getOption     : function( option ){ return o[option]; },
        init               : init,
        render             : render,
        getValues          : getValues
    }

}

})();

//FENIX Catalog Data sets Component Plugin registration
if(!window.Fenix_catalog_bridge_plugins) window.Fenix_catalog_bridge_plugins = {};
window.Fenix_catalog_bridge_plugins['fenix_catalog_demo'] =  (function() {

    var o = { },
    //Default Catalog options Options
        defaultOptions = {
            name          : 'fenix_catalog_demo_plugin',
            component_name: 'fenix_catalog_demo'
        };

    function init( baseOptions ){

        //Merge options
        extend(o, defaultOptions);
        extend(o, baseOptions);

    }

    function getOption( option ){ return o.component.getOption( option ) }

    function getFilter(){

        try { return createJsonFilter( o.component.getValues( true ) ) }
        catch(e) {  throw new Error(e); }

    }

    function createJsonFilter( values ) {


        var r = '{ "filter": { "types": [], "metadata":{ }, "data" : { }, "business" : [] }, "require" : { "index" : true, "metadata" : true  } }';
        var result = JSON.parse ( r );

        if (values["querystring"]){
            result.filter.queryString = {}
            result.filter.queryString.language = "EN";
            result.filter.queryString.query = values["querystring"];
        }

        var m = result.filter.metadata;

        if ( values["geographicExtent"] ){
            m.region = [{"code":{"systemKey":"GAUL", "systemVersion":"1.0", "code": values["geographicExtent"]}}];
        }

        if (values["owner"]){ m.source = [ {id : values["owner"]} ]; }

        /*
        m.basePeriod = [{  }];
        m.basePeriod[0].fromDate = new Date(values.basePeriod.min, 0, 0);
        m.basePeriod[0].toDate = new Date(values.basePeriod.max, 0, 0);
        */

        return JSON.stringify( result );
    }

    return {
        init      : init,
        getOption : getOption,
        getFilter : getFilter
    };

})();