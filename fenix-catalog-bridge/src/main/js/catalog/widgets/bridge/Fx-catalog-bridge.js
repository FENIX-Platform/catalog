/*global define */

define([
    "jquery"
], function ($) {

    var o = { },
        defaultOptions = {
            error_prefix: "Fx_catalog_bridge ERROR: ",
            url: 'http://hqlprfenixapp2.hq.un.fao.org:4242/catalog/search'
        };

    function Fx_catalog_bridge(options) {
    }

    Fx_catalog_bridge.prototype.init = function (options) {

        //Merge options
        $.extend(o, defaultOptions);
        $.extend(o, options);

        return $(this);
    };

    Fx_catalog_bridge.prototype.query = function (src, callback, context) {
        var plugin;

        if (!window.Fx_catalog_bridge_plugins || typeof window.Fx_catalog_bridge_plugins !== "object") {
            throw new Error(o.error_prefix + " Fx_catalog_bridge_plugins plugins repository not valid.");
        } else {
            plugin = window.Fx_catalog_bridge_plugins[src.getName()];
        }

        if (!plugin) {
            throw new Error(o.error_prefix + " plugin not found.")
        }

        if (typeof plugin.init !== "function") {
            throw new Error(o.error_prefix + " plugin for " + src.getName() + " does not have a public init() method.");
        } else {
            plugin.init({component: src});
        }

        if (typeof callback !== "function") {
            throw new Error(o.error_prefix + " callback param is not a function");
        } else {

            //Ask the plugin the filter, make the request and pass data to callback()
            $.ajax({
                url: o.url,
                type: 'post',
                contentType: 'application/json',
                dataType: 'json',
                success: function (response, textStatus, jqXHR ) {

                    if (context) {
                        $.proxy(callback, context, response)();
                    } else {
                        callback(response)
                    }
                },
                data: JSON.stringify(plugin.getFilter())
            });
        }
    };

    return Fx_catalog_bridge;

});