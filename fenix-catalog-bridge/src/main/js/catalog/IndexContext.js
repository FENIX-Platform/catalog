/*global define */

define([
        "controller/Fx-catalog-index",
        "controller/Fx-catalog-filter",
        "widgets/filter/Fx-catalog-collapsible-menu",
        "widgets/filter/Fx-catalog-modular-form"],
    function(Controller, FilterController, Menu, Form ) {

    var html_ids = {
        MENU: "fx-catalog-modular-menu",
        FORM: "fx-catalog-modular-form"
        },
        //Components
        //Page level
        pageController,
        //Filter level
        filterController, menu, form;

    function IndexContext(){}

    IndexContext.prototype.init = function() {
        var self = this;

        pageController = new Controller();

        // Perform dependency injection by extending objects
        $.extend(pageController, {
            filter:  self.initFilter()
        });

        pageController.render();

    };

    IndexContext.prototype.initFilter = function( ){

        filterController = new FilterController();
        menu = new Menu();
        form = new Form();

        menu.init({
            container: document.querySelector("#" + html_ids.MENU),
            config: "json/fx-catalog-collapsible-menu-config.json"
        });

        form.init({
            container: document.querySelector("#" + html_ids.FORM),
            config: "json/fx-catalog-modular-form-config.json",
            grid : {
                drag: {
                    handle: '.fx-catalog-modular-form-handler',
                    containment: "#" +  html_ids.FORM
                },
                config : {
                    itemSelector: '.fx-catalog-form-module',
                    columnWidth: '.fx-catalog-form-module'
                }
            }
        });

        // Perform dependency injection by extending objects
        $.extend(filterController, {
            menu: menu,
            form: form
        });

        return filterController;

    };

    return IndexContext;

});