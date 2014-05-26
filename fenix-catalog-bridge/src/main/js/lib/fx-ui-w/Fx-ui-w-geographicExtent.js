define([
    "jquery",
    "jqwidgets"], function ($) {

    function Fx_ui_w_geographicExtent() {
    };

    Fx_ui_w_geographicExtent.prototype.validate = function (e) {
        if (!e.hasOwnProperty("source")) {
            throw new Error("ELEM_NOT_SOURCE");
        } else {
            if (!e.source.hasOwnProperty("datafields")) {
                throw new Error("ELEM_NOT_DATAFIELDS");
            }
        }

        return true;
    };

    Fx_ui_w_geographicExtent.prototype.render = function (e, container) {

        var source, dataAdapter;

        // prepare the data
        source = $.extend({datatype: "json"}, e.component.source);
        dataAdapter = new $.jqx.dataAdapter(source, {
            loadError: function (jqXHR, status, error) {
                throw new Error("CONNECTION_FAIL");
            }
        });
        // Create a jqxListBox
        $(container).jqxListBox($.extend({ source: dataAdapter}, e.component.rendering));
    };

    Fx_ui_w_geographicExtent.prototype.getValue = function (e) {
        var codes = $("#" + e.id).jqxListBox('val').split(','),
            system = e.details.cl.system,
            version = e.details.cl.version,
            results = [];

        for (var i = 0 ; i < codes.length; i++){
            results.push({code: {code : codes[i], systemKey : system, systemVersion:version}});
        }

        return results;
    };

    return Fx_ui_w_geographicExtent;
});