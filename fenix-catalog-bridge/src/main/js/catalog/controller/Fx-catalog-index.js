/*global define */

define(function( ) {

    function PageController(){ };

    //(injected)
    PageController.prototype.filter = undefined;


    PageController.prototype.renderComponents = function(){
        var self = this;

        self.filter.render();

    };

    PageController.prototype.initEventListeners = function(){

    };

    PageController.prototype.preValidation = function(){
        var self = this;

        if (!self.filter) {throw new Error("PAGE CONTROLLER: INVALID FILTER ITEM.")}
    }

    PageController.prototype.render = function() {
        var self = this;

        self.preValidation();
        self.initEventListeners();

        self.renderComponents();

    };

    return PageController;

});