/*global define */

define([
    'widgets/results/Fx-catalog-results-generator'
], function (ResultGenerator) {

    function ResultsController() {

        this.resultGenerator = new ResultGenerator();
    }

    //(injected)
    ResultsController.prototype.grid = undefined;

    //(injected)
    ResultsController.prototype.resultsRenderer = undefined;

    ResultsController.prototype.renderComponents = function () {
        this.grid.render();
    };

    ResultsController.prototype.initEventListeners = function () {
    };

    ResultsController.prototype.preValidation = function () {
        var self = this;

        if (!self.grid) {
            throw new Error("ResultsController: INVALID GRID ITEM.")
        }
        if (!self.resultsRenderer) {
            throw new Error("ResultsController: INVALID RENDER ITEM.")
        }
    };

    ResultsController.prototype.render = function () {
        var self = this;

        self.preValidation();
        self.initEventListeners();
        self.renderComponents();
    };

    ResultsController.prototype.addItems = function (response) {

        this.grid.clear();
        var items = response.resources;

        for (var i = 0; i < items.length; i++) {
            this.grid.addItems(this.resultGenerator.getInstance(items[i]));
        }

    };

    return ResultsController;

});