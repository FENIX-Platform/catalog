/*global define */

define(function( ) {

    function ModularCatalogController(){ };

    //(injected)
    ModularCatalogController.prototype.menu = undefined;

    //(injected)
    ModularCatalogController.prototype.form = undefined;

    ModularCatalogController.prototype.preValidation = function(){
        var self = this;

        if (!self.menu) {throw new Error("CONTROLLER: INVALID MENU ITEM.")}
        if (!self.form) {throw new Error("CONTROLLER: INVALID FORM ITEM.")}
    }

    ModularCatalogController.prototype.start = function() {
        var self = this;

        self.preValidation();
        self.renderPage();
        self.initEventListeners();
    };

    ModularCatalogController.prototype.renderPage = function(){
        var self = this;

        self.menu.render();
        self.form.render();

    };

    ModularCatalogController.prototype.initEventListeners = function(){

        var self = this;

        document.body.addEventListener("fx.catalog.menu.select", function (e) {
             self.form.addItem(e.detail.semantic);
        }, false);

        document.body.addEventListener("fx.catalog.menu.remove", function (e) {
            self.menu.activate(e.detail.semantic)
            self.form.removeItem(e.detail.module);
        }, false);
    }

    return ModularCatalogController;

});