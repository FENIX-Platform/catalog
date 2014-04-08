define(["jquery", "fenix-ui-creator-js", "widgets/fx_w_commons", "jquery.sortable"], function ($, Fenix_ui_creator, W_Commons) {

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
        }, uiCreator, blank_conf, w_Commons;

    var modules = [];
    var types = {
        TIME_SERIES: "TIME_SERIES",
        GEOGRAPHICAL_AREA: "GEOGRAPHICAL_AREA",
        FREE_FORM: "FREE_FORM"
    };

    function Fenix_catalog_bridge_modular_filter(){
        uiCreator = new Fenix_ui_creator();
        w_Commons = new W_Commons();

    };

    // Ad-hoc module render function
    Fenix_catalog_bridge_modular_filter.prototype.renderFreeForm = function($blank) {
        var c = $blank.find("." + o.css_classes.CONTENT);

        var id = "fx-free-form-mod-" + w_Commons.getFenixUniqueId();
        c.attr("id", id);

        console.log("ID container " + id)

        uiCreator.render({
            cssClass: "form-elements",
            container: "#" + id,
            elements: JSON.stringify([blank_conf[types.FREE_FORM]])
        });

    }

    Fenix_catalog_bridge_modular_filter.prototype.renderTimeSeries = function($blank) {

        var c = $blank.find("." + o.css_classes.CONTENT);

        var id = "fx-time-series-mod-" + w_Commons.getFenixUniqueId();
        c.attr("id", id);

        console.log("ID container " + id);

        uiCreator.render({
            cssClass: "form-elements",
            container: "#" + id,
            elements: JSON.stringify([blank_conf[types.TIME_SERIES]])
        });

    }

    Fenix_catalog_bridge_modular_filter.prototype.renderGeo = function($blank) {
        var c = $blank.find("." + o.css_classes.CONTENT);
        var id = "fx-geo-mod-" + w_Commons.getFenixUniqueId();
        c.attr("id", id);

        console.log("ID container " + id)

        uiCreator.render({
            cssClass: "form-elements",
            container: "#" + id,
            elements: JSON.stringify([blank_conf[types.GEOGRAPHICAL_AREA]])
        });
    }

    //TODO cancellare perche' le functioni devono essere sulla semantica del modulo e non sul tipo di windget
    Fenix_catalog_bridge_modular_filter.prototype.renderList = function($blank) {
        var c = $blank.find("." + o.css_classes.CONTENT);
        var id = "fx-geo-mod-" + w_Commons.getFenixUniqueId();
        c.attr("id", id);

        console.log("ID container " + id)

        uiCreator.render({
            cssClass: "form-elements",
            container: "#" + id,
            elements: JSON.stringify([blank_conf["LIST"]])
        });
    }

    Fenix_catalog_bridge_modular_filter.prototype.renderTree = function($blank) {
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

    Fenix_catalog_bridge_modular_filter.prototype.renderDynamicTree = function($blank) {
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

    Fenix_catalog_bridge_modular_filter.prototype.renderDropdown = function($blank) {
        var c = $blank.find("." + o.css_classes.CONTENT);
        var id = "fx-geo-mod-" + w_Commons.getFenixUniqueId();
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

    Fenix_catalog_bridge_modular_filter.prototype.getBlankModule = function(kind) {

        var $li = $("<li ></li>");

        $li.attr("data-semantic", kind);
        $li.append("<div class='" + o.css_classes.HANDLER + "'>:::</div>");
        $li.append("<div class='" + o.css_classes.CONTENT + "'></div>");

        var $close_btn = $("<div class='" + o.css_classes.CLOSE_BTN + "'>X</div>").on("click", { o: o }, function (e) {
            w_Commons.raiseCustomEvent(document.body, o.events.REMOVE_MODULE, { semantic: kind });
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

    Fenix_catalog_bridge_modular_filter.prototype.addItem = function(kind) {

        var self = this;

        if (o.callback_fns.hasOwnProperty(kind)) {
            console.log("callback for " + kind);
            o.callback_fns[kind].render(self.getBlankModule(kind));
            self.makeListDraggable();
        }

    }

    Fenix_catalog_bridge_modular_filter.prototype.getValues = function() {
        return uiCreator.getValues(false, modules);
    }

    Fenix_catalog_bridge_modular_filter.prototype.makeListDraggable = function() {

        $(o.container).sortable({ handle: "." + o.css_classes.HANDLER });

    }

    Fenix_catalog_bridge_modular_filter.prototype.initStructure = function() {

        var self = this;

        self.makeListDraggable();

    };

    Fenix_catalog_bridge_modular_filter.prototype.render = function(options) {

        var self = this;

        $.extend(o, options);

        if (o.hasOwnProperty("url")) {

            $.getJSON(o.url, function(){
                self.initStructure();
            }).error(function () {
                throw new Error("Fenix_catalog_bridge_plus_btn: impossible to load config JSON.");
            });
        } else {
            self.initStructure();
        }
    }

    Fenix_catalog_bridge_modular_filter.prototype.init = function(options) {

        var self = this;

        //Merge options
        $.extend(o, defaultOptions);
        $.extend(o, options);

        o.callback_fns[types.TIME_SERIES] = { render: self.renderTimeSeries};
        o.callback_fns[types.GEOGRAPHICAL_AREA] = { render: self.renderGeo};
        o.callback_fns[types.FREE_FORM] = { render: self.renderFreeForm};
        //TODO cancellare
        o.callback_fns["LIST"] = { render: self.renderList};
        o.callback_fns["TREE"] = { render: self.renderTree};
        o.callback_fns["DYNAMICTREE"] = { render: self.renderDynamicTree};
        o.callback_fns["DROPDOWN"] = { render: self.renderDropdown};
        //TODO fino a qui

        $.getJSON(o.config, function (json) {

            blank_conf = json;

            if (o.autorender) {
                self.render();
            }
        }).error(function(){
            throw new Error("Fenix_catalog_bridge_modular_filter no init JSon");
        });

    }

    return Fenix_catalog_bridge_modular_filter;

});