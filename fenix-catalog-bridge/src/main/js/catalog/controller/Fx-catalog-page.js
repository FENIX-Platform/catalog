/*global define */

define([], function( ) {

    function PageController(){ }

    //(injected)
    PageController.prototype.filter = undefined;

    //(injected)
    PageController.prototype.bridge = undefined;

    //(injected)
    PageController.prototype.results = undefined;

    PageController.prototype.renderComponents = function(){
        var self = this;

        self.filter.render();
        //self.results.render();
    };

    PageController.prototype.initEventListeners = function(){

        var self = this;

        document.body.addEventListener("submit.catalog.fx", function (e) {
            console.log("LISTENING submit.catalog.fx");
            self.bridge.query(self.filter, self.results.addItems)
        }, false);

    };

    PageController.prototype.preValidation = function(){
        var self = this;

        if (!self.filter) {throw new Error("PAGE CONTROLLER: INVALID FILTER ITEM.")}
    };

    PageController.prototype.render = function(){
        var self = this;

        self.preValidation();
        self.initEventListeners();

        self.renderComponents();

    };

    return PageController;

});