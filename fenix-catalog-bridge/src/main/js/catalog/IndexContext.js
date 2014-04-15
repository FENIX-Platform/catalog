/*global define */

define(["controller/Fx-catalog-index",
        "controller/Fx-catalog-filter",
        "widgets/filter/Fx-catalog-collapsible-menu",
        "widgets/filter/Fx-catalog-modular-form",
        "structures/Fx-fluid-grid",
        "widgets/bridge/Fx-catalog-bridge",
        "controller/Fx-catalog-results",
        "widgets/results/Fx-catalog-results-generator"],
    function(Controller, FilterController, Menu, Form, FluidForm, Bridge, ResultController, ResultsRenderer) {

    var html_ids = {
        MENU: "fx-catalog-modular-menu",
        FORM: "fx-catalog-modular-form"
        },
        //Components
        //Page level
        pageController,
        //Filter level
        filterController, menu, form,
        //Bridge level
        bridge,
        //Result level
        resultsController, render, grid;

    function IndexContext(){}

    IndexContext.prototype.init = function() {
        var self = this;

        pageController = new Controller();

        // Perform dependency injection by extending objects
        $.extend(pageController, {
            filter: self.initFilter(),
            bridge: self.initBridge(),
            results: self.initResults()
        });

        pageController.render();

    };

    IndexContext.prototype.initFilter = function(){

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

        $.extend(form, {
            grid: new FluidForm()
        })

        // Perform dependency injection by extending objects
        $.extend(filterController, {
            menu: menu,
            form: form
        });

        return filterController;

    };

    IndexContext.prototype.initBridge = function(){
        bridge = new Bridge();
        return bridge;
    };

    IndexContext.prototype.initResults = function(){

        resultsController = ResultController();
        render = ResultsRenderer();
        grid =  true

        return resultsController;
    };

    return IndexContext;

});