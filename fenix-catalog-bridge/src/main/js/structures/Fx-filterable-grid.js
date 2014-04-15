define(["jquery", "isotope"], function ($) {

    var o = { },
    //Default Catalog Results Grid options Options
        defaultOptions = {
            data_filter_value: "data-filter-value",
            css_filter_active: "catalog-filter-active"

        };

    var $container;

    function Fx_Filterable_grid() {
    };

    Fx_Filterable_grid.prototype.initBtns = function () {

        // filter items on button click
        $(o.filters).on('click', 'button', function (event) {
            $container.isotope({ filter: $(this).attr(o.data_filter_value) });
            $(o.filters).find(" button").removeClass(o.css_filter_active);
            $(this).addClass(o.css_filter_active);
        });

        $(o.filters).find("button[" + o.data_filter_value + "='*']").addClass(o.css_filter_active);

    };

    Fx_Filterable_grid.prototype.filter = function (filterValue) {

        $("button").removeClass(o.css_filter_active);
        $("button[" + o.data_filter_value + "='" + filterValue + "']").addClass(o.css_filter_active);
        $container.isotope({ filter: filterValue });
    };

    Fx_Filterable_grid.prototype.clear = function () {
        $container.isotope('remove', $container.isotope('getItemElements'));
        this.filter("*");
    };

    Fx_Filterable_grid.prototype.addItems = function (items) {
        $container.isotope('insert', items);
    };

    Fx_Filterable_grid.prototype.validateOptions = function () {

        //Validate HTML Container
        if ($(o.container).length === 0) {
            throw new Error('Invalid HTML container for ' + o.name);
        }

        //Required Library
        if (!jQuery().isotope) {
            throw new Error("Isotope.js not found");
        }

    };

    Fx_Filterable_grid.prototype.render = function (options) {

        $.extend(o, options);

        this.validateOptions();

        //Safe because after validateOptions()
        $container = $(o.container);
        $container.isotope(o.isotope);

        this.initBtns();
    };

    Fx_Filterable_grid.prototype.init = function (baseOptions) {

        //Merge options
        $.extend(o, defaultOptions);
        $.extend(o, baseOptions);

    };

    //Public API
    return Fx_Filterable_grid
});