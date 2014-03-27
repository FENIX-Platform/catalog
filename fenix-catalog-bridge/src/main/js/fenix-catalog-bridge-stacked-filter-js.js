(function () {
    "use strict";

    var types = {
        TIME_SERIES: "TIME_SERIES",
        GEOGRAPHICAL_AREA: "GEOGRAPHICAL_AREA",
        FREE_FORM: "FREE_FORM"
    };

    window.Fenix_catalog_bridge_plus_btn = function (options) {

        var o = { },
            defaultOptions = {
                autorender: true,
                events: {
                    SELECT: "button_select"
                },
                //selectors
                items_json_selector: "items",
                s_dropdown: '.dropdown-menu',
                lang: 'EN'
            };
        var $ul;

        function render(options) {
            $.extend(o, options);

            if (o.hasOwnProperty("url")) {

                $.getJSON(o.url,function (data) {
                    initStructure();
                    renderMenuItems(data);
                }).fail(function () {
                    throw new Error("Fenix_catalog_bridge_plus_btn: impossible to load config JSON.");
                });
            }
        }

        function initStructure() {

            $(o.container).addClass("dropdown");

            //TODO to change with a div and CSS style
            var $icon = $(document.createElement("SPAN"));
            $icon.addClass("glyphicon");
            $icon.addClass("glyphicon-plus");
            $icon.attr("role", "button");
            //Required to be present on the dropdown's trigger element.
            $icon.attr("data-toggle", "dropdown");

            $ul = $(document.createElement("UL"));
            $ul.addClass("dropdown-menu");
            $ul.attr("role", "menu");

            $(o.container).append($icon);
            $(o.container).append($ul);
            $(o.s_dropdown).dropdown();

        }

        function renderMenuItems(json) {

            if (json.hasOwnProperty(o.items_json_selector)) {

                var items = json.items;

                for (var i = 0; i < items.length; i++) {

                    var $li = $(document.createElement("LI"));
                    $li.attr("role", "presentation");

                    //Icon
                    var $icon = $('<span></span>');

                    //Label
                    var $label = $('<a role="menuitem"></a>');
                    $label.html(items[i].label[o.lang.toUpperCase()]);

                    //Styling label and icon
                    if (items[i].hasOwnProperty("style")) {
                        if (items[i].style.hasOwnProperty("label")) {
                            $label.addClass(items[i].style.label);
                        }
                        if (items[i].style.hasOwnProperty("icon")) {
                            $icon.addClass(items[i].style.icon);
                        }
                    }
                    ;

                    $label.append($icon);
                    $li.append($label);

                    //needed to activate item
                    $li.attr("data-semantic", items[i].semantic);

                    //callback on click
                    $li.on('click', {semantic: items[i].semantic }, function (event) {

                        //Check if button disabled
                        if (!$(this).hasClass("disabled")) {
                            raiseCustomEvent(document.body, o.events.SELECT, { semantic: event.data.semantic });
                            disable(event.data.semantic);
                        }

                    });

                    $ul.append($li);
                }

            } else {
                throw new Error("Fenix_catalog_bridge_plus_btn: no 'items' attribute in config JSON.")
            }

        }

        function init(options) {

            //Merge options
            $.extend(o, defaultOptions);
            $.extend(o, options);

            if (o.autorender) {
                render();
            }

        }

        function disable(semantic) {
            $ul.find("[data-semantic='" + semantic + "']").addClass("disabled");
        }

        function activate(semantic) {
            $ul.find("[data-semantic='" + semantic + "']").removeClass("disabled");
        }

        return {
            init: init,
            disable: disable,
            activate: activate
        }
    }

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
                    throw new Error("Fenix_catalog_bridge_plus_btn: impossible to load config JSON.");
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

})();