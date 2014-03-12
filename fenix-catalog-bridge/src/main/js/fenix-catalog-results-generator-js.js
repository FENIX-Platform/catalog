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

function Fenix_catalog_result_dataset( options ) {

      var o = { };
      //Default Result options
      var defaultOptions = {
          s_result      : ".fenix-result",
          s_desc_title  : ".fx_result_description_title",
          s_desc_source : ".fx_result_description_source",
          s_desc_geo    : ".fx_result_description_geograficalarea",
          s_desc_period : ".fx_result_description_baseperiod",
          error_prefix  : "FENIX Result dataset creation error: "

      };
      var $result;

      function initText(){

          $result.find( o.s_desc_title ).html(o.source.name);
          $result.find( o.s_desc_source ).html(o.source.source);
          $result.find( o.s_desc_geo ).html(o.source.metadata.geographicExtent.title['EN']);
          $result.find( o.s_desc_period ).html("from " + new Date(o.source.metadata.basePeriod.from).getFullYear() +" to " + new Date(o.source.metadata.basePeriod.to).getFullYear());

      };

      function initModal(){

          $result.find( "#myModalLabel").html(o.source.name);

      }

      function getHtml( callback ){

          //Merge options
          extend(o, defaultOptions);
          extend(o, options);

          $result = $(fragments).find( o.s_result );
          if ( $result.length === 0){ throw new Error( o.error_prefix + "HTML fragment not found"); }
          $result.addClass("dataset");

          initText();
          initModal();

          //Check callback is a function
          if ( callback && typeof callback === "function" ){ callback( $result ); }
          else { throw new Error( o.error_prefix + "getHtml() #1 param is not a function");}
      }

      return { getHtml : getHtml }

}

function Fenix_catalog_result_layer( options ) {

    var o = { };
    //Default Result options
    var defaultOptions = {
        s_result      : ".fenix-result",
        s_desc_title  : ".fx_result_description_title",
        s_desc_source : ".fx_result_description_source",
        s_desc_geo    : ".fx_result_description_geograficalarea",
        s_desc_period : ".fx_result_description_baseperiod",
        s_icon        : "#fx_result_icon_img",
        error_prefix  : "FENIX Result layer creation error: "
    };
    var $result;

    function initText(){

        $result.find( o.s_desc_title ).html(o.source.name);
        $result.find( o.s_desc_source ).html(o.source.source);

        $result.find( o.s_desc_geo ).html(o.source.metadata.geographicExtent.title['EN']);
        $result.find( o.s_desc_period ).html("from " + new Date(o.source.metadata.basePeriod.from).getFullYear() +" to " + new Date(o.source.metadata.basePeriod.to).getFullYear());

    };

    function initModal(){

        $result.find( "#myModalLabel").html(o.source.name);

    }

    function getHtml( callback ){

        //Merge options
        extend(o, defaultOptions);
        extend(o, options);

        $result = $(fragments).find( o.s_result );
        if ( $result.length === 0){ throw new Error( o.error_prefix + "HTML fragment not found"); }

        $result.addClass("layer");
        $result.find( o.s_icon ).attr("src","css/img/mind_map60.png");

        initText();
        initModal();

        //Check callback is a function
        if (  callback && typeof callback === "function" ){ callback( $result ); }
        else { throw new Error( o.error_prefix + "getHtml() #1 param is not a function");}

    }

    return { getHtml : getHtml }

    }

})();