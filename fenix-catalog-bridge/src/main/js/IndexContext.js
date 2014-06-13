/*global define */

define(["catalog/controller/Fx-catalog-page",
        "controller/Fx-catalog-filter",
        "widgets/filter/Fx-catalog-collapsible-menu",
        "widgets/filter/Fx-catalog-modular-form",
        "widgets/filter/Fx-catalog-resume-bar",
        "structures/Fx-fluid-grid",
        "widgets/bridge/Fx-catalog-bridge",
        "controller/Fx-catalog-results",
        "widgets/results/Fx-catalog-results-generator",
        "structures/Fx-filterable-grid",
        "structures/Fx-crazy-grid"
    ],
    function (Controller, FilterController, Menu, Form, Resume, FluidForm, Bridge, ResultController, ResultsRenderer, FilterableGrid, CrazyGrid) {

        var html_ids = {
            MENU: "fx-catalog-modular-menu",
            FORM: "fx-catalog-modular-form",
            SUBMIT: "fx-catalog-submit-btn",
            RESULT: "fx-catalog-results",
            RESUME: "fx-catalog-resume"
        };

        function IndexContext() {
        }

        IndexContext.prototype.init = function () {
            var self = this,
                pageController = new Controller();

            // Perform dependency injection by extending objects
            $.extend(pageController, {
                filter: self.initFilter(),
                bridge: self.initBridge(),
                results: self.initResults()
            });

            pageController.render();

        };

        IndexContext.prototype.initFilter = function () {

            var filterController = new FilterController(),
                menu = new Menu(),
                form = new Form(),
                resume = new Resume(),
                grid =  new FluidForm();

            menu.init({
                container: document.querySelector("#" + html_ids.MENU),
                config: "json/fx-catalog-collapsible-menu-config.json"
            });
            form.init({
                container: document.querySelector("#" + html_ids.FORM),
                config: "json/fx-catalog-modular-form-config.json"
            });

            grid.init({
                container: document.querySelector("#" + html_ids.FORM),
                drag: {
                    handle: '.fx-catalog-modular-form-handler',
                    containment: "#" + html_ids.FORM
                },
                config: {
                    itemSelector: '.fx-catalog-form-module',
                    columnWidth: '.fx-catalog-form-module',
                    rowHeight: '.fx-catalog-form-module'
                }
            });

            $.extend(form, {
                grid: grid
            });

            resume.init({
                container: document.querySelector("#" + html_ids.RESUME)
            });

            // Perform dependency injection by extending objects
            $.extend(filterController, {
                menu: menu,
                form: form,
                resume: resume,
                submit: document.querySelector("#" + html_ids.SUBMIT)
            });

            return filterController;

        };

        IndexContext.prototype.initBridge = function () {
            var bridge = new Bridge();
            bridge.init();
            return bridge;
        };

        IndexContext.prototype.initResults = function () {

            var resultsController = new ResultController(),
                grid = new FilterableGrid(),
                //grid = new CrazyGrid();
                renderer = new ResultsRenderer();

            grid.init({
                container: document.querySelector("#" + html_ids.RESULT),
                isotope: {
                    itemSelector: '.fenix-result',
                    layoutMode: 'fitRows'
                }
            });

            $.extend(resultsController, {
                resultsRenderer: renderer,
                grid: grid
            });

            return resultsController;
        };

        return IndexContext;

    });
