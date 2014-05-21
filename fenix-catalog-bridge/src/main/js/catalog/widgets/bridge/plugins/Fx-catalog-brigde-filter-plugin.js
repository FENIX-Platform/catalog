define([
    "jquery",
    "text!json/fx-catalog-filter-mapping.json",
    "text!json/fx-catalog-blank-filter.json",
    "text!json/request.json"
], function($, mapping, blank, req) {

    var o = { };

    function FilterPlugin(options){
        $.extend(o, options);

    }

    FilterPlugin.prototype.preValidation = function(){

        if (!o.component){
            throw new Error("FILTER PLUGIN: no valid filter component during inti()");
        }

    };

    FilterPlugin.prototype.init = function( options ){
        var self = this;
        //Merge options
        $.extend(o, options);

        self.preValidation();

    };

    FilterPlugin.prototype.getFilter = function(){

        var self = this;

        try { return self.createJsonFilter( o.component.getValues( true ) ) }
        catch(e) {  throw new Error(e); }

    };

    FilterPlugin.prototype.createJsonFilter= function( values ) {

        var result = JSON.parse ( blank );

        var m = result.filter.metadata;

        if (values["simplerange"]){
            m[this.getFilterField("simplerange")] = values["simplerange"];
        }
          return  JSON.parse( req );
        //return JSON.stringify( result );
    };

    FilterPlugin.prototype.getFilterField = function( type ){

        var m = JSON.parse ( mapping );

        for (var i = 0; i < m.length; i ++){
            var k = Object.keys(m[i]);
            if (k[0] === type) {return m[i][type]; }
        }
    };

    return FilterPlugin;

});