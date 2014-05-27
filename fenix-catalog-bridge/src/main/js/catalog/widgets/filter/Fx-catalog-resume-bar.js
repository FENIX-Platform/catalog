define([
    "jquery",
    "widgets/Fx-widgets-commons",
    "bootstrap"
], function ($, W_Commons) {

    var o = { },
        defaultOptions = {
            widget: {
                lang: 'EN'
            },
            events: {
                READY: 'fx.catalog.module.ready',
                REMOVE: 'fx.catalog.module.remove'
            }
        };

    var cache = {},
        w_Commons, $collapse;

    function Fx_Catalog_Resume_Bar() {
        w_Commons = new W_Commons();
    }

    Fx_Catalog_Resume_Bar.prototype.init = function (options) {

        //Merge options
        $.extend(o, defaultOptions);
        $.extend(o, options);

    };

    Fx_Catalog_Resume_Bar.prototype.render = function (options) {

        this.initEventListeners();
        this.initStructure();

    };

    Fx_Catalog_Resume_Bar.prototype.initStructure = function () {

    };

    Fx_Catalog_Resume_Bar.prototype.removeItem = function (item) {
        this.findResumeItem(item).remove();
    };

    Fx_Catalog_Resume_Bar.prototype.addItem = function (item) {

        var module = this.findResumeItem(item.module);

        if (module.length !== 0) { module.html(item.value);
        } else {  $(o.container).append(this.createResumeItem(item)); }

    };

    Fx_Catalog_Resume_Bar.prototype.initEventListeners = function () {

        var that = this;

        document.body.addEventListener(o.events.READY, function (e) {
            that.addItem(e.detail)
        }, false);

        document.body.addEventListener(o.events.REMOVE, function (e) {
            console.log(e.detail.type)
            that.removeItem(e.detail.type)
        }, false);

    };

    Fx_Catalog_Resume_Bar.prototype.findResumeItem = function (module) {
        return  $(o.container).find('[data-module="' + module + '" ]');
    };

    Fx_Catalog_Resume_Bar.prototype.createResumeItem = function ( item ) {
        return  $('<div data-module="' + item.module + '">' + item.value + '</div>');
    };

    return Fx_Catalog_Resume_Bar;

});