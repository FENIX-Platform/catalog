define(["jquery", "fenix-ui-creator-js", "widgets/Fx-widgets-commons"], function ($, UiCreator, W_Commons) {

    var o = { },
        defaultOptions = {
            widget: {
                lang: 'EN'
            },
            css_classes: {
                HANDLER: "fx-catalog-modular-form-handler",
                CONTENT: "fx-catalog-modular-form-content",
                CLOSE_BTN: "fx-catalog-modular-form-close-btn",
                MODULE: 'fx-catalog-form-module',
                RESIZE: "fx-catalog-modular-form-resize-btn"
            },
            events: {
                REMOVE_MODULE: "fx.catalog.menu.remove"
            },
            callback_fns: {}
        }, uiCreator, w_Commons, cache = {};

    //Form module displayed
    var modules = [],
        types = {
            TIME_SERIES: "TIME_SERIES",
            GEOGRAPHICAL_AREA: "GEOGRAPHICAL_AREA",
            FREE_FORM: "FREE_FORM"
        };

    function Fx_catalog_modular_form() {

        uiCreator = new UiCreator();
        w_Commons = new W_Commons();

    }

    //(injected)
    Fx_catalog_modular_form.prototype.grid = undefined;

    // Ad-hoc module render function
    Fx_catalog_modular_form.prototype.renderFreeForm = function ($blank) {
        var c = $blank.find("." + o.css_classes.CONTENT);

        var id = "fx-free-form-mod-" + w_Commons.getFenixUniqueId();
        c.attr("id", id);


        uiCreator.render({
            cssClass: "form-elements",
            container: "#" + id,
            elements: JSON.stringify([cache.json[types.FREE_FORM]])
        });

    };

    Fx_catalog_modular_form.prototype.renderTimeSeries = function ($blank) {

        var c = $blank.find("." + o.css_classes.CONTENT);

        var id = "fx-time-series-mod-" + w_Commons.getFenixUniqueId();
        c.attr("id", id);

        uiCreator.render({
            cssClass: "form-elements",
            container: "#" + id,
            elements: JSON.stringify([cache.json[types.TIME_SERIES]])
        });

    };

    Fx_catalog_modular_form.prototype.renderGeo = function ($blank) {
        var c = $blank.find("." + o.css_classes.CONTENT);
        var id = "fx-geo-mod-" + w_Commons.getFenixUniqueId();
        c.attr("id", id);

        uiCreator.render({
            cssClass: "form-elements",
            container: "#" + id,
            elements: JSON.stringify([cache.json[types.GEOGRAPHICAL_AREA]])
        });
    };

    //TODO cancellare perche' le functioni devono essere sulla semantica del modulo e non sul tipo di windget
    Fx_catalog_modular_form.prototype.renderList = function ($blank) {
        var c = $blank.find("." + o.css_classes.CONTENT);
        var id = "fx-geo-mod-" + w_Commons.getFenixUniqueId();
        c.attr("id", id);

        uiCreator.render({
            cssClass: "form-elements",
            container: "#" + id,
            elements: JSON.stringify([cache.json["LIST"]])
        });
    };

    Fx_catalog_modular_form.prototype.renderTree = function ($blank) {
        var c = $blank.find("." + o.css_classes.CONTENT);
        var id = "fx-geo-mod-" + w_Commons.getFenixUniqueId();
        c.attr("id", id);

        uiCreator.render({
            cssClass: "form-elements",
            container: "#" + id,
            elements: JSON.stringify([cache.json["TREE"]])
        });
    };

    Fx_catalog_modular_form.prototype.renderDynamicTree = function ($blank) {
        var c = $blank.find("." + o.css_classes.CONTENT);
        var id = "fx-geo-mod-" + w_Commons.getFenixUniqueId();
        c.attr("id", id);

        uiCreator.render({
            cssClass: "form-elements",
            container: "#" + id,
            elements: JSON.stringify([cache.json[types.GEOGRAPHICAL_AREA]])
        });
    };

    Fx_catalog_modular_form.prototype.renderDropdown = function ($blank) {
        var c = $blank.find("." + o.css_classes.CONTENT);
        var id = "fx-geo-mod-" + w_Commons.getFenixUniqueId();
        c.attr("id", id);

        uiCreator.render({
            cssClass: "form-elements",
            container: "#" + id,
            elements: JSON.stringify([cache.json["DROPDOWN"]])
        });
    };
    //TODO fino a qui
    // End of ad-hoc module render function

    Fx_catalog_modular_form.prototype.removeItem =  function(item){
        var self = this;
        self.grid.removeItem(item)
    };

    Fx_catalog_modular_form.prototype.addItem = function (kind) {

        var self = this;

        if (o.callback_fns.hasOwnProperty(kind)) {
            var blank = self.getBlankModule(kind);
            self.grid.addItem(blank.get(0));
            o.callback_fns[kind].render(blank);
        }

    };

    Fx_catalog_modular_form.prototype.getBlankModule = function (kind) {

        var self = this;

        var $module = $("<div class='"+o.css_classes.MODULE+"'></div>");

        $module.attr("data-semantic", kind);
        $module.append("<div class='" + o.css_classes.HANDLER + "'>::::::</div>");
        $module.append("<div class='" + o.css_classes.CONTENT + "'></div>");

        var $close_btn = $("<div class='" + o.css_classes.CLOSE_BTN + "'>XxX</div>")
            .on("click", { o: o }, function () {
            w_Commons.raiseCustomEvent(document.body, o.events.REMOVE_MODULE, { semantic: kind, module: $module.get(0)});

            for (var i = 0; i < modules.length; i++) {

                if (modules[i]["kind"] === kind) {
                    modules.splice(i, 1);
                }
            }

        });

        $module.append($close_btn);

        var $resize = $("<div class='" + o.css_classes.RESIZE + "'>RESIZE</div>")
            .on("click", { module: $module.get(0) }, function (e) {

                self.grid.resize(e.data.module);
            });

        $module.append($resize);

        $(o.container).append($module);

        modules.push({id: cache.json[kind].id, type: cache.json[kind].type, kind: kind});

        return $module;
    };

    Fx_catalog_modular_form.prototype.initStructure = function () {

        var self= this;

        self.grid.init({
            container: o.container,
            config: o.grid.config,
            drag: o.grid.drag
        });
        self.grid.render();

    };

    Fx_catalog_modular_form.prototype.render = function (options) {
        var self = this;

        $.extend(o, options);

        if (!cache.json) {

            if (o.hasOwnProperty("config")) {
                $.getJSON(o.config, function (json) {
                    cache.json = json;
                    self.initStructure();
                }).error(function () {
                    throw new Error("fx-modular-form: impossible to load config JSON.");
                });
            }
        } else {
            self.initStructure();
        }
    } ;

    Fx_catalog_modular_form.prototype.init = function (options) {
        var self = this;

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

    };

    Fx_catalog_modular_form.prototype.getValues = function(boolean) {
        return uiCreator.getValues(boolean, modules);
    };

    return Fx_catalog_modular_form;

});