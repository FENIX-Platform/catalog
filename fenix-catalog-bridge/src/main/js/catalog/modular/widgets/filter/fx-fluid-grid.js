define(['jquery', 'widgets/fx_w_commons',
        'packery', 'draggabilly'], function ($, W_Commons, Packery, Draggabilly) {

    var o = { },
        defaultOptions = { };

    var pckry, w_Commons;

    function Fx_Fluid_Grid() {
        w_Commons = new W_Commons();
    };

    Fx_Fluid_Grid.prototype.addItem = function (item) {
        var self = this;

        // append elements to container
        o.container.appendChild(item);
        // add and lay out newly appended elements
        pckry.appended(item);

        var itemElems = pckry.getItemElements();

        for (var i = 0; i < itemElems.length; i++) {
            var elem = itemElems[i];
            // make element draggable with Draggabilly
            var draggie = new Draggabilly(elem, {
                handle: o.handle
            });
            // bind Draggabilly events to Packery
            pckry.bindDraggabillyEvents(draggie);
        }

    };

    Fx_Fluid_Grid.prototype.removeItem = function (item) {

        // remove clicked element
        pckry.remove( item );
        // layout remaining item elements
        pckry.layout();
    };

    Fx_Fluid_Grid.prototype.initStructure = function () {

        pckry = new Packery(o.container, o.config);

        var itemElems = pckry.getItemElements();

        for (var i = 0; i < itemElems.length; i++) {
            var elem = itemElems[i];
            // make element draggable with Draggabilly
            var draggie = new Draggabilly(elem, {
                handle: o.handle
            });
            // bind Draggabilly events to Packery
            pckry.bindDraggabillyEvents(draggie);
        }
    };

    Fx_Fluid_Grid.prototype.preValidation = function () {

        if (!w_Commons.isElement(o.container)){
            throw new Error("Fluid Grid: IVALID_CONTAINER.")
        }

        if (!o.hasOwnProperty("config")){
            throw new Error("Fluid Grid: NO CONFIG")
        }

        if (!o.hasOwnProperty("handle")){
            throw new Error("Fluid Grid: NO HANDLER SELECTOR")
        }



    };

    Fx_Fluid_Grid.prototype.render = function (options) {
        var self = this;
        $.extend(o, options);

        self.preValidation();
        self.initStructure();

    };

    Fx_Fluid_Grid.prototype.init = function (options) {
        $.extend(o, options);
    };

    return Fx_Fluid_Grid;

})