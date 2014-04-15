/*global define */

define(["plugins/Fx-catalog-brigde-filter-plugin"], function( Plugin ) {

    function FilterController(){
      var self = this;
      self.publishFxCatalogBridgePlugin();
    }

    //(injected)
    FilterController.prototype.menu = undefined;

    //(injected)
    FilterController.prototype.form = undefined;

    FilterController.prototype.renderComponents = function(){
        var self = this;

        self.menu.render();
        self.form.render();

    };

    FilterController.prototype.initEventListeners = function(){

        var self = this;

        document.body.addEventListener("fx.catalog.menu.select", function (e) {
             self.form.addItem(e.detail.semantic);
        }, false);

        document.body.addEventListener("fx.catalog.menu.remove", function (e) {
            self.menu.activate(e.detail.semantic);
            self.form.removeItem(e.detail.module);
        }, false);
    };

    FilterController.prototype.preValidation = function(){
        var self = this;

        if (!self.menu) {throw new Error("CONTROLLER: INVALID MENU ITEM.")}
        if (!self.form) {throw new Error("CONTROLLER: INVALID FORM ITEM.")}
    };

    FilterController.prototype.render = function() {
        var self = this;

        self.preValidation();
        self.initEventListeners();

        self.renderComponents();

    };

    FilterController.prototype.publishFxCatalogBridgePlugin = function(){
        var self = this;

        var plugin = new Plugin();
        plugin.init({filter : self});


        //FENIX Catalog Plugin Registration
        if(!window.Fenix_catalog_bridge_plugins) window.Fenix_catalog_bridge_plugins = {};
        window.Fenix_catalog_bridge_plugins['Fenix_catalog_bridge_modular_filter'] = true;

    };

    FilterController.prototype.getValues = function( boolean ){

        console.log(this.form.getValues(boolean));

        return {test : "test"};
    };

    return FilterController;

});