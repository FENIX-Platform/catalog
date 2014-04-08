define(["jquery", "widgets/fx_w_commons", "bootstrap"], function ($, W_Commons) {

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
    var $ul, w_Commons;

    function Fenix_catalog_bridge_plus_btn(options) {
        w_Commons = new W_Commons();
    };

    Fenix_catalog_bridge_plus_btn.prototype.init = function (options) {

        var self = this;

        //Merge options
        $.extend(o, defaultOptions);
        $.extend(o, options);

        if (o.autorender) {
            self.render();
        }

    }

    Fenix_catalog_bridge_plus_btn.prototype.render = function (options) {
        var self = this;
        $.extend(o, options);

        if (o.hasOwnProperty("url")) {

            $.getJSON(o.url, function (data) {
                self.initStructure();
                self.renderMenuItems(data);
            }).fail(function () {
                throw new Error("Fenix_catalog_bridge_plus_btn: impossible to load config JSON.");
            });
        }
    };

    Fenix_catalog_bridge_plus_btn.prototype.initStructure = function () {

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

    };

    Fenix_catalog_bridge_plus_btn.prototype.renderMenuItems = function (json) {

        if (json.hasOwnProperty(o.items_json_selector)) {



            var items = json.items,
                self = this;;

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
                        w_Commons.raiseCustomEvent(document.body, o.events.SELECT, { semantic: event.data.semantic });
                        self.disable(event.data.semantic);
                    }

                });

                $ul.append($li);
            }

        } else {
            throw new Error("Fenix_catalog_bridge_plus_btn: no 'items' attribute in config JSON.")
        }

    }

    Fenix_catalog_bridge_plus_btn.prototype.disable = function (semantic) {
        $ul.find("[data-semantic='" + semantic + "']").addClass("disabled");
    }

    Fenix_catalog_bridge_plus_btn.prototype.activate = function (semantic) {
        $ul.find("[data-semantic='" + semantic + "']").removeClass("disabled");
    }

    return Fenix_catalog_bridge_plus_btn;

})