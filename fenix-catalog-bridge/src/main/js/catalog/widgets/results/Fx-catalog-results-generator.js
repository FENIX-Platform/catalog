/*
STANDARD: Each ad-hoc fenix-resource-type result creator function has to be a public getHtml method that accept as
    unique parameter a callback function. This is to allow asynchronous operations.
*/
/*
  FENIX Catalog Bridge Factory

  The component create different instance FENIX Catalog Result.
  e.g.
    var factory   = new Fenix_catalog_result_factory();
    var result    = factory.getInstance({id : 'mycustomid', ...})
    result.render( opts )
*/

(function(){
"use strict";

var fragments;

window.Fenix_catalog_result_factory = function(){

    var status;

    $.ajax({
        url         : "html/fx_result_fragments.html",
        beforeSend  : function(){ status = "INITIALIZING"; }
    }).success( function(data) {
        status = "READY";
        fragments = data;
    }).error( function(jqXHR, textStatus, errorThrown){
        throw new Error("Fenix_catalog_result_factory: " + errorThrown);
    });

    Fenix_catalog_result_factory.prototype.getInstance = function( options ) {

        //milliseconds
        var timeout = 100;

        switch ( status ){
            case "READY" :
                switch ( options.source.resourceType.toUpperCase() ){
                    case "DATASET" :
                        return new Fenix_catalog_result_dataset( options );
                        break;
                    case "CODELIST" :
                        return new Fenix_catalog_result_codelist( options );
                        break;
                    case "LAYER" :
                        return new Fenix_catalog_result_layer( options );
                        break;
                };
                break;
            case "INITIALIZING" :
                setTimeout(function () { Fenix_catalog_result_factory.getInstance(options); }, timeout)
                break;

        }
    }

}



})();