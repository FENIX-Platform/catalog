(function () {
    "use strict";

    window.Fenix_catalog_bridge_plus_btn = function (options) {

        var o = { },
            defaultOptions = {
                autorender: true,
                //selectors
                s_items: "items",
                s_dropdown: '.dropdown-menu',
                lang: 'EN'
            },
            types;
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
            $(o.s_dropdown).dropdown()

        }

        function renderMenuItems(json) {

            var items;

            if (json.hasOwnProperty(o.s_items)) {

                items = json.items;

                for (var i = 0; i < items.length; i++) {

                    var $li = $(document.createElement("LI"));
                    $li.attr("role", "presentation");
                    $li.attr("id", items[i].id)

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

                    //callback on click
                    $li.on('click', {semantic: items[i].semantic }, function (event) {

                        console.log("raised")
                        raiseCustomEvent( document.body, "button_select", { semantic : event.data.semantic });
                    });

                    $ul.append($li);
                }

                //TODO togliere in produzione
                $("#disable").on('click', function () {
                    disable("id1");
                })
                $("#activate").on('click', function () {
                    console.log("activate");
                    activate("id1");
                })

            } else {
                throw new Error("Fenix_catalog_bridge_plus_btn: no 'items' attribute in config JSON.")
            }

        }

        function init(options) {

            //Merge options
            $.extend(o, defaultOptions);
            $.extend(o, options);

            types = {
                /*TIMESERIES: {
                 render: renderTimeSeries,
                 val: getValueTimeSeries
                 }*/
            };

            if (o.autorender) {
                render();
            }

        }

        function disable(id) { $ul.find("[id='" + id + "']").addClass("disabled"); }

        function activate(id) { $ul.find("[id='" + id + "']").removeClass("disabled"); }

        return {
            init: init,
            disable: disable,
            activate: activate
        }
    }

    window.Fenix_catalog_bridge_modular_filter = function (options) {

        var o = { },
            defaultOptions = {
                autorender: true,
                //selectors
                s_items: "items",
                s_dropdown: '.dropdown-menu',
                lang: 'EN'
            },
            types;
        var $ul;

        function render(options) {
            $.extend(o, options);

            if (o.hasOwnProperty("url")) {

                $.getJSON(o.url,function (data) {
                    initStructure();
                }).fail(function () {
                    throw new Error("Fenix_catalog_bridge_plus_btn: impossible to load config JSON.");
                });
            }
        }

        function initStructure() {

            $(o.container).sortable({  handle: 'span' });

        }


        function init(options) {

            //Merge options
            $.extend(o, defaultOptions);
            $.extend(o, options);

            types = {
                /*TIMESERIES: {
                 render: renderTimeSeries,
                 val: getValueTimeSeries
                 }*/
            };

            if (o.autorender) {
                render();
            }

        }

        function addItem(){
            console.log("addme")
        }

        return {
            init: init,
            addItem : addItem
        }
    }

})();