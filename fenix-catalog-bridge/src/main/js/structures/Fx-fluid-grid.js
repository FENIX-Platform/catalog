/*global define*/

define([
    'jquery',
    'widgets/Fx-widgets-commons',
    'packery',
    'draggabilly'
], function ($, W_Commons, Packery, Draggabilly) {

    var o = { },
        defaultOptions = {
            css: {
                FIT: "fit"
            }};

    var pckry, w_Commons;

    function Fx_Fluid_Grid() {
        w_Commons = new W_Commons();
    }

    Fx_Fluid_Grid.prototype.resize = function (item) {

        var $item = $(item);

        if ($item.hasClass(o.css.FIT)) {
            $item.removeClass(o.css.FIT);
            pckry.layout();
        } else {
            $item.addClass(o.css.FIT);
            pckry.fit($item.get(0));
        }

        return $item.get(0);

    };

    Fx_Fluid_Grid.prototype.addItem = function (item) {
        var self = this;

        // append elements to container
        o.container.appendChild(item);
        // add and lay out newly appended elements
        pckry.appended(item);

        var draggie = new Draggabilly(item, o.drag);
        // bind Draggabilly events to Packery
        pckry.bindDraggabillyEvents(draggie);

        pckry.layout();

        setTimeout(function () {
            pckry.layout();
        }, 100);

    };

    Fx_Fluid_Grid.prototype.removeItem = function (item) {

        // remove clicked element
        pckry.remove(item);
        // layout remaining item elements
        pckry.layout();
    };

    Fx_Fluid_Grid.prototype.initStructure = function () {

        pckry = new Packery(o.container, o.config);

        var itemElems = pckry.getItemElements();

        for (var i = 0; i < itemElems.length; i++) {
            var elem = itemElems[i];
            // make element draggable with Draggabilly
            var draggie = new Draggabilly(elem, o.drag);
            // bind Draggabilly events to Packery
            pckry.bindDraggabillyEvents(draggie);
        }
    };

    Fx_Fluid_Grid.prototype.preValidation = function () {

        if (!w_Commons.isElement(o.container)) {
            throw new Error("Fluid Grid: IVALID_CONTAINER.")
        }

        if (!o.hasOwnProperty("config")) {
            throw new Error("Fluid Grid: NO CONFIG")
        }

        if (!o.drag.hasOwnProperty("handle")) {
            throw new Error("Fluid Grid: NO HANDLER SELECTOR")
        }

    };

    Fx_Fluid_Grid.prototype.clear = function () {
        pckry.remove(pckry.getItemElements());
    };

    Fx_Fluid_Grid.prototype.render = function (options) {

        $.extend(o, options);

        this.preValidation();
        this.initStructure();

    };

    Fx_Fluid_Grid.prototype.init = function (options) {
        $.extend(o, defaultOptions);
        $.extend(o, options);

    };

    return Fx_Fluid_Grid;

});