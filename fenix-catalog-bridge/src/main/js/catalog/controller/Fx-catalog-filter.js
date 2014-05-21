/*global define */
define([
    "plugins/Fx-catalog-brigde-filter-plugin",
    "widgets/Fx-widgets-commons"
], function( Plugin, W_Commons ) {

    var w_Commons,
        name = 'fx-catalog-filter';

    function FilterController(){

      var self = this;
      self.publishFxCatalogBridgePlugin();

      w_Commons = new W_Commons();

    }

    //(injected)
    FilterController.prototype.menu = undefined;

    //(injected)
    FilterController.prototype.form = undefined;

    //(injected)
    FilterController.prototype.submit = undefined;

    FilterController.prototype.initSubmit = function(){
        var self = this;
        $(self.submit).on("click", function(){
            w_Commons.raiseCustomEvent(self.submit, "submit.catalog.fx", {});
        });
    };

    FilterController.prototype.renderComponents = function(){
        var self = this;

        self.menu.render();
        self.form.render();

    };

    FilterController.prototype.initEventListeners = function(){

        var self = this;

        document.body.addEventListener("fx.catalog.menu.select", function (e) {
             self.form.addItem(e.detail);
        }, false);

        document.body.addEventListener("fx.catalog.menu.remove", function (e) {
            self.menu.activate(e.detail.type);
            self.form.removeItem(e.detail.module);
        }, false);
    };

    FilterController.prototype.preValidation = function(){
        var self = this;

        if (!self.menu) {throw new Error("FilterController: INVALID MENU ITEM.")}
        if (!self.form) {throw new Error("FilterController: INVALID FORM ITEM.")}
        if (!self.submit) {throw new Error("FilterController: INVALID SUBMIT ITEM.")}
        if (!w_Commons.isNode(self.submit)){throw new Error("FilterController: SUBMIT NOT DOM NODE.")}

    };

    FilterController.prototype.render = function() {
        var self = this;

        self.preValidation();
        self.initEventListeners();
        self.initSubmit();

        self.renderComponents();

    };

    FilterController.prototype.publishFxCatalogBridgePlugin = function(){

        //FENIX Catalog Plugin Registration
        if(!window.Fx_catalog_bridge_plugins) { window.Fx_catalog_bridge_plugins = {}; }
        window.Fx_catalog_bridge_plugins[name] = new Plugin();

    };

    FilterController.prototype.getValues = function( boolean ){
        return this.form.getValues(boolean);
    };

    FilterController.prototype.getName = function(){
        return name;
    }

    return FilterController;

});