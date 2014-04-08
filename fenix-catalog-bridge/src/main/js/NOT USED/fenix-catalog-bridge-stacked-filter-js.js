(function () {
    "use strict";

    var types = {
        TIME_SERIES: "TIME_SERIES",
        GEOGRAPHICAL_AREA: "GEOGRAPHICAL_AREA",
        FREE_FORM: "FREE_FORM"
    };

    window.Fenix_catalog_bridge_modular_filter = function (options) {

        var o = { },
            defaultOptions = {
                css_classes: {
                    HANDLER: "fx-filter-builder-module-handler",
                    CONTENT: "fx-filter-builder-module-content",
                    CLOSE_BTN: "fx-filter-builder-module-close-btn"
                },
                events: {
                    REMOVE_MODULE: "remove_module"
                },
                autorender: true,
                lang: 'EN',
                callback_fns: {}
            }, uiCreator, blank_conf;

        var modules = [];

        // Ad-hoc module render function

        function renderFreeForm($blank) {
            var c = $blank.find("." + o.css_classes.CONTENT);

            var id = "fx-free-form-mod-" + getFenixUniqueId();
            c.attr("id", id);

            console.log("ID container " + id)

            uiCreator.render({
                cssClass: "form-elements",
                container: "#" + id,
                elements: JSON.stringify([blank_conf[types.FREE_FORM]])
            });

        }

        function renderTimeSeries($blank) {

            var c = $blank.find("." + o.css_classes.CONTENT);

            var id = "fx-time-series-mod-" + getFenixUniqueId();
            c.attr("id", id);

            console.log("ID container " + id)

            uiCreator.render({
                cssClass: "form-elements",
                container: "#" + id,
                elements: JSON.stringify([blank_conf[types.TIME_SERIES]])
            });

        }

        function renderGeo($blank) {
            var c = $blank.find("." + o.css_classes.CONTENT);
            var id = "fx-geo-mod-" + getFenixUniqueId();
            c.attr("id", id);

            console.log("ID container " + id)

            uiCreator.render({
                cssClass: "form-elements",
                container: "#" + id,
                elements: JSON.stringify([blank_conf[types.GEOGRAPHICAL_AREA]])
            });
        }

        //TODO cancellare
        function renderList($blank) {
            var c = $blank.find("." + o.css_classes.CONTENT);
            var id = "fx-geo-mod-" + getFenixUniqueId();
            c.attr("id", id);

            console.log("ID container " + id)

            uiCreator.render({
                cssClass: "form-elements",
                container: "#" + id,
                elements: JSON.stringify([blank_conf["LIST"]])
            });
        }

        function renderTree($blank) {
            var c = $blank.find("." + o.css_classes.CONTENT);
            var id = "fx-geo-mod-" + getFenixUniqueId();
            c.attr("id", id);

            console.log("ID container " + id)

            uiCreator.render({
                cssClass: "form-elements",
                container: "#" + id,
                elements: JSON.stringify([blank_conf["TREE"]])
            });
        }

        function renderDynamicTree($blank) {
            var c = $blank.find("." + o.css_classes.CONTENT);
            var id = "fx-geo-mod-" + getFenixUniqueId();
            c.attr("id", id);

            console.log("ID container " + id)

            uiCreator.render({
                cssClass: "form-elements",
                container: "#" + id,
                elements: JSON.stringify([blank_conf[types.GEOGRAPHICAL_AREA]])
            });
        }

        function renderDropdown($blank) {
            var c = $blank.find("." + o.css_classes.CONTENT);
            var id = "fx-geo-mod-" + getFenixUniqueId();
            c.attr("id", id);

            console.log("ID container " + id)

            uiCreator.render({
                cssClass: "form-elements",
                container: "#" + id,
                elements: JSON.stringify([blank_conf["DROPDOWN"]])
            });
        }
        //TODO fino a qui

        // End of ad-hoc module render function

        function getBlankModule(kind) {

            var $li = $("<li ></li>");

            $li.attr("data-semantic", kind);
            $li.append("<div class='" + o.css_classes.HANDLER + "'>:::</div>");
            $li.append("<div class='" + o.css_classes.CONTENT + "'></div>");

            var $close_btn = $("<div class='" + o.css_classes.CLOSE_BTN + "'>X</div>").on("click", { o: o }, function (e) {
                raiseCustomEvent(document.body, o.events.REMOVE_MODULE, { semantic: kind });
                $(e.data.o.container).find("[data-semantic='" + kind + "']").remove();

                for (var i = 0; i < modules.length; i++) {

                    if (modules[i]["kind"] === kind) {
                        modules.splice(i, 1);
                    }
                }

            });

            $li.append($close_btn);
            $(o.container).append($li);

            modules.push({id: blank_conf[kind].id, type: blank_conf[kind].type, kind: kind})

            return $li;
        }

        function addItem(kind) {

            if (o.callback_fns.hasOwnProperty(kind)) {
                console.log("callback for " + kind);
                o.callback_fns[kind].render(getBlankModule(kind));
                makeListDraggable();
            }

        }

        function getValues() {
            return uiCreator.getValues(false, modules);
        }

        function makeListDraggable() {

            $(o.container).sortable({ handle: "." + o.css_classes.HANDLER });

        }

        function initStructure() {

            makeListDraggable();

        }

        function render(options) {

            $.extend(o, options);

            if (o.hasOwnProperty("url")) {

                $.getJSON(o.url, initStructure).fail(function () {
                    throw new Error("Fenix_catalog_bridge_modular_filter: impossible to load config JSON.");
                });
            }
        }

        function init(options) {

            //Merge options
            $.extend(o, defaultOptions);
            $.extend(o, options);

            o.callback_fns[types.TIME_SERIES] = { render: renderTimeSeries};
            o.callback_fns[types.GEOGRAPHICAL_AREA] = { render: renderGeo};
            o.callback_fns[types.FREE_FORM] = { render: renderFreeForm};
            //TODO cancellare
            o.callback_fns["LIST"] = { render: renderList};
            o.callback_fns["TREE"] = { render: renderTree};
            o.callback_fns["DYNAMICTREE"] = { render: renderDynamicTree};
            o.callback_fns["DROPDOWN"] = { render: renderDropdown};
            //TODO fino a qui

            $.getJSON(o.config, function (json) {

                blank_conf = json;

                //Init FENIX UI creator
                if (window.Fenix_ui_creator && typeof window.Fenix_ui_creator === "function") {

                    uiCreator = Fenix_ui_creator();

                    if (o.autorender) {
                        render();
                    }

                } else {
                    throw new Error("Fenix_catalog_bridge_modular_filter no init JSOn")
                }
            });

        }

        return {
            init: init,
            addItem: addItem,
            getValues: getValues
        }
    }

    //FENIX Catalog Plugin Registration
    if(!window.Fenix_catalog_bridge_plugins) window.Fenix_catalog_bridge_plugins = {};
    window.Fenix_catalog_bridge_plugins['Fenix_catalog_bridge_modular_filter'] = function() {

        var o = { },
        //Default Catalog options Options
            defaultOptions = {
                name          : 'Fenix_catalog_bridge_modular_filter_plugin',
                component_name: 'Fenix_catalog_bridge_modular_filter'
            };

        function init( baseOptions ){

            //Merge options
            extend(o, defaultOptions);
            extend(o, baseOptions);

        }

        function getOption( option ){ return o.component.getOption( option ) }

        function getFilter(){

            try { return createJsonFilter( o.component.getValues( true ) ) }
            catch(e) {  throw new Error(e); }

        }

        function createJsonFilter( values ) {


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
        }

        return {
            init      : init,
            getOption : getOption,
            getFilter : getFilter
        };
    }

})();