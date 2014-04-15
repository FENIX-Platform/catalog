define([], function () {
    var o = { },
        defaultOptions = {
            error_prefix: "Fx_catalog_bridge ERROR: "
        };

    function Fx_catalog_bridge(options) {
    };

    Fx_catalog_bridge.prototype.init = function (options) {

        //Merge options
        extend(o, defaultOptions);
        extend(o, options);

    };

    Fx_catalog_bridge.prototype.query = function (src, callback) {

        var plugin;

        if (!src || typeof src.getOption !== "function") {
            throw new Error(o.error_prefix + " query() first parameter has to be a valid FENIX Catalog component.")
        }

        if (!window.Fx_catalog_bridge_plugins || typeof window.Fx_catalog_bridge_plugins !== "object") {
            throw new Error(o.error_prefix + " Fx_catalog_bridge_plugins plugins repository not valid.");
        } else {
            plugin = window.Fx_catalog_bridge_plugins[src.getOption('name')];
        }

        if (!plugin) {
            throw new Error(o.error_prefix + " plugin not found.")
        }
        ;

        if (typeof plugin.init !== "function") {
            throw new Error(o.error_prefix + " plugin for " + src.getOption('name') + " does now a public init method.");
        } else {
            plugin.init({component: src});
        }

        if (typeof callback !== "function") {
            throw new Error(o.error_prefix + " callback param is not a function");
        } else {
            callback(plugin.getFilter());
        }

    };

    return Fx_catalog_bridge;

});