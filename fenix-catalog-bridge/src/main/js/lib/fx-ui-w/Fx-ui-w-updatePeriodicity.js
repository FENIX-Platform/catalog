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
        var result = $("#" + e.id).jqxListBox('val');
        return result.split(',');
    };

    return Fx_ui_w_geographicExtent;
});