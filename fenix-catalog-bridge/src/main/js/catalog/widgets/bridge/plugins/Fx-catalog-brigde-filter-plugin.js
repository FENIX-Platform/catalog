define(["jquery"], function($) {

    var o = { };

    function FilterPlugin(options ){
        $.extend(o, options);
    };

    FilterPlugin.prototype.preValidation = function(){

        if (!o.filter){
            throw new Error("FILTER PLUGIN: no valid filter component during inti()");
        };

    };

    FilterPlugin.prototype.init = function( options ){
        var self = this;
        //Merge options
        $.extend(o, options);

        self.preValidation();

    };

    FilterPlugin.prototype.getFilter = function(){

        var self = this;

        try { return self.createJsonFilter( o.filter.getValues( true ) ) }
        catch(e) {  throw new Error(e); }

    };

    FilterPlugin.prototype.createJsonFilter= function( values ) {


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
    };

    return FilterPlugin;

});