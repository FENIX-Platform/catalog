/*global define */

define([], function() {

    function ResultsController(){
    }

    //(injected)
    ResultsController.prototype.grid = undefined;

    //(injected)
    ResultsController.prototype.resultsRenderer = undefined;

    ResultsController.prototype.renderComponents = function(){
        var self = this;

        self.grid.render();

    };

    ResultsController.prototype.initEventListeners = function(){};

    ResultsController.prototype.preValidation = function(){
        var self = this;

        if (!self.grid) {throw new Error("ResultsController: INVALID GRID ITEM.")}
        if (!self.resultsRenderer) {throw new Error("ResultsController: INVALID RENDER ITEM.")}
    };

    ResultsController.prototype.render = function() {
        var self = this;

        self.preValidation();
        self.initEventListeners();

        self.renderComponents();

    };

    ResultsController.prototype.addItems = function(items){
        console.log("ResultsController")
        console.log(items)
    };

    return ResultsController;

});