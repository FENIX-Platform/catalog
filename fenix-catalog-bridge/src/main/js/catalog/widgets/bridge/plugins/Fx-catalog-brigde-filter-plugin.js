define([
    "jquery",
    "text!json/fx-catalog-filter-mapping.json",
    "text!json/fx-catalog-blank-filter.json",
    "text!json/request.json"
], function ($, map, blank, req) {

    var o = { };

    function FilterPlugin(options) {
        $.extend(o, options);

    }

    FilterPlugin.prototype.preValidation = function () {

        if (!o.component) {
            throw new Error("FILTER PLUGIN: no valid filter component during inti()");
        }

    };

    FilterPlugin.prototype.init = function (options) {
        var self = this;
        //Merge options
        $.extend(o, options);

        self.preValidation();

    };

    FilterPlugin.prototype.getFilter = function () {

        var self = this;

        try {
            return self.createJsonFilter(o.component.getValues(true))
        }
        catch (e) {
            throw new Error(e);
        }

    };

    FilterPlugin.prototype.createJsonFilter = function (values) {

        var request = JSON.parse(blank),
            keys = Object.keys(values),
            mapping = JSON.parse(map),
            position = request;

        for (var i = 0; i < keys.length; i++) {
            if (values.hasOwnProperty(keys[i])) {
                if (mapping.hasOwnProperty(keys[i])){

                    if (mapping[keys[i]].conversion) { values[keys[i]] = this.convertValue(values[keys[i]], mapping[keys[i]].conversion); };

                    var path = mapping[keys[i]].path.split(".");

                    for (var j = 0; j < path.length - 1; j++) { position = position[path[j]]; }

                    position[path[ path.length - 1 ]] = values[keys[i]];
                    position = request;
                }
            }
        }
        console.log(request)
        return  JSON.parse(req);
        //return JSON.stringify( request );
    };

    FilterPlugin.prototype.convertValue = function(value, rules ){

        var rulesKeys = Object.keys(rules);

        for (var i = 0; i < rulesKeys.length; i++){
            if (rules.hasOwnProperty(rulesKeys[i])){
                if (value.hasOwnProperty(rulesKeys[i])){
                    value[rules[rulesKeys[i]]] =  value[rulesKeys[i]];
                    delete value[rulesKeys[i]];
                }
            }
        }

        return value;

    };

    return FilterPlugin;

});