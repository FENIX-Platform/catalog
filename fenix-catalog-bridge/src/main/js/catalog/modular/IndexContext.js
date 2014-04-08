/*global define */

define([ "controller/FormMenuController",
        "widgets/filter/fx-catalog-collapsible-menu",
        "widgets/filter/fx-catalog-modular-form"], function( Controller, Menu, Form ) {

    var html_ids = {
        MENU: "fx-catalog-modular-menu",
        FORM: "fx-catalog-modular-form"
        },
    //Components
    controller, menu, form;

    function IndexContext(){}

    IndexContext.prototype.init = function() {
        var self = this;

        controller = new Controller();
        menu = new Menu();
        form = new Form();

        self.initComponents();

        // Perform dependency injection by extending objects
        $.extend(controller, {
            menu: menu,
            form: form
        });

        controller.start();

    };

    IndexContext.prototype.initComponents = function(){

        menu.init({
            container: document.querySelector("#" + html_ids.MENU),
            config: "json/fx-catalog-collapsible-menu-config.json"
        });

        form.init({
            container: document.querySelector("#" + html_ids.FORM),
            config: "json/fx-catalog-modular-form-config.json",
            grid : {
                handle: '.fx-catalog-modular-form-handler',
                config : {
                    itemSelector: '.fx-catalog-form-module'
                }
            }
        });

    }

    return IndexContext;

});