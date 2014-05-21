define(["jquery", "text!html/fx_result_fragments.html"], function ($, template) {

    var o = { };
    //Default Result options
    var defaultOptions = {
        s_result: ".fenix-result",
        s_desc_title: ".fx_result_description_title",
        s_desc_source: ".fx_result_description_source",
        s_desc_geo: ".fx_result_description_geograficalarea",
        s_desc_period: ".fx_result_description_baseperiod",
        error_prefix: "FENIX Result dataset creation error: "

    };
    var $result;

    function Fx_catalog_result_render_dataset(options) {
        $.extend(o, options);
    }

    Fx_catalog_result_render_dataset.prototype.initText = function () {

        $result.find(o.s_desc_title).html(o.name);
        $result.find(o.s_desc_source).html(o.source);
        $result.find(o.s_desc_geo).html(o.metadata.geographicExtent.title['EN']);
        //$result.find( o.s_desc_period ).html("from " + new Date(o.metadata.basePeriod.from).getFullYear() +" to " + new Date(o.metadata.basePeriod.to).getFullYear());

    };

    Fx_catalog_result_render_dataset.prototype.initModal = function () {

        $result.find("#myModalLabel").html(o.name);

    };

    Fx_catalog_result_render_dataset.prototype.getHtml = function (callback) {

        var self = this;

        //Merge options
        $.extend(o, defaultOptions);

        $result = $(template).find(o.s_result);
        if ($result.length === 0) {
            throw new Error(o.error_prefix + "HTML fragment not found");
        }
        $result.addClass("dataset");

        self.initText();
        self.initModal();

        return $result.get(0)

        //Check callback is a function
        if (callback && typeof callback === "function") {
            callback($result);
        }
        else { /*throw new Error( o.error_prefix + "getHtml() #1 param is not a function");*/
        }
    };

    return Fx_catalog_result_render_dataset;

});
