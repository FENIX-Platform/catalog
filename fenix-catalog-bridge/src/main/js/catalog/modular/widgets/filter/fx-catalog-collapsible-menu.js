define(["jquery", "widgets/fx_w_commons", "bootstrap"], function ($, W_Commons) {

    var o = { },
        defaultOptions = {
        widget : {
            lang :'EN'
            },
        events : {
            SELECT : 'fx.catalog.menu.select'
        }
        };

    var cache = {},
        w_Commons, $collapse;

    function Fx_Catalog_Collapsible_Menu() {
        w_Commons = new W_Commons();
    };

    Fx_Catalog_Collapsible_Menu.prototype.init = function (options) {

        //Merge options
        $.extend(o, defaultOptions);
        $.extend(o, options);

    };

    Fx_Catalog_Collapsible_Menu.prototype.render = function (options) {
        var self = this;
        $.extend(o, options);

        if (!cache.json){

            if (o.hasOwnProperty("config")) {

                $.getJSON(o.config, function(data) {
                    cache.json = data;
                    self.initStructure();
                    self.renderMenu(data);
                }).error(function () {
                    throw new Error("Fx_Catalog_Collapsible_Menu: impossible to load config JSON.");
                });
            }
        } else {
            self.initStructure();
            self.renderMenu(cache.json);
        }
    };

    Fx_Catalog_Collapsible_Menu.prototype.initStructure = function () {

        o.collapseId = "fx-collapse-" + w_Commons.getFenixUniqueId();

        $collapse = $('<div class="panel-group" id="accordion"></div>');
        $collapse.attr("id", o.collapseId);

        $(o.container).append($collapse);

    };

    Fx_Catalog_Collapsible_Menu.prototype.renderMenu = function(json) {

        var self = this;

        if (json.hasOwnProperty("panels")) {

            var panels = json.panels;

            for (var i = 0; i < panels.length; i++) {

                $collapse.append(self.buildPanel(panels[i]))

            }

            $(o.container).append( $collapse )

        } else {
            throw new Error("Fx_Catalog_Collapsible_Menu: no 'panels' attribute in config JSON.")
        }
    };

    Fx_Catalog_Collapsible_Menu.prototype.buildPanel = function(panel){
        var self = this,
            id = "fx-collapse-panel-" + w_Commons.getFenixUniqueId();

        var $p = $(document.createElement("DIV"));
        $p.addClass("panel");
        $p.addClass("panel-default");

        $p.append(self.buildPanelHeader(panel, id));
        $p.append(self.buildPanelBody(panel, id));

        return $p;
    }

    Fx_Catalog_Collapsible_Menu.prototype.buildPanelHeader = function(panel, id){

        //Init header
        var $header = $('<div class="panel-heading"></div>'),
            $title = $('<h4 class="panel-title"></h4>'),
            $a = $('<a data-toggle="collapse"></a>');

        $a.attr("data-parent", "#"+o.collapseId);
        $a.attr("href", "#"+id);

        if (panel.hasOwnProperty("title")) {
            $a.html(panel["title"][o.widget.lang]);
        }

        return $header.append($title.append($a));

    };

    Fx_Catalog_Collapsible_Menu.prototype.buildPanelBody = function(panel, id){

        //Init panel body
        var $bodyContainer = $("<div class='panel-collapse collapse'></div>");
        $bodyContainer.attr("id", id);

        var $body = $('<div class="panel-body"></div>');

        if (panel.hasOwnProperty("modules")){
            var modules = panel["modules"];

            for (var j=0; j< modules.length; j++){

                var $module = $("<div></div>"),
                    $btn = $('<button type="button" class="btn btn-default"></button>');

                $btn.on('click', {semantic : modules[j].semantic },function(e){
                    var $btn = $(this);

                    if ($btn.is(':disabled') === false) {
                        $btn.attr("disabled", "disabled");
                        w_Commons.raiseCustomEvent(o.container, o.events.SELECT , {semantic : e.data.semantic})
                    }

                })

                if (modules[j].hasOwnProperty("id")){
                    $btn.attr("id", modules[j].id);
                }

                if (modules[j].hasOwnProperty("semantic")){
                    $btn.attr("data-semantic", modules[j].semantic);
                }

                if (modules[j].hasOwnProperty("label")){
                    $btn.html(modules[j].label[o.widget.lang]);
                }

                $module.append($btn);
                $body.append($module)
            }

        };

        return $bodyContainer.append($body);
    }

    Fx_Catalog_Collapsible_Menu.prototype.disable = function (semantic) {
        $(o.container).find("[data-semantic='" + semantic + "']").attr("disabled", "disabled");
    }

    Fx_Catalog_Collapsible_Menu.prototype.activate = function (semantic) {

        $(o.container).find("[data-semantic='" + semantic + "']").removeAttr("disabled");

    }

    return Fx_Catalog_Collapsible_Menu;

})