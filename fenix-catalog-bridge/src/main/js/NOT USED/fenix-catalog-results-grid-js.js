/* FENIX Catalog Datasets Component */
(function() {
"use strict";

window.Fenix_catalog_results_grid = function(){

    var o = { },
        //Default Catalog Results Grid options Options
        defaultOptions = {
            data_filter_value : "data-filter-value",
            css_filter_active : "catalog-filter-active"

        };

    var $container;

    function init( baseOptions ){

        //Merge options
        extend(o, defaultOptions);
        extend(o, baseOptions);

        if (o.autorender) { render(); }
    }

    function validateOptions(){

        //Validate HTML Container
        if ( $(o.container).length === 0 ) { throw new Error('Invalid HTML container for '+ o.name); }

        //Required Library
        if(!jQuery().isotope){ throw new Error("Isotope.js not found"); }

    }

    function render( options ){

        if (options) { extend(o, options); }

        validateOptions();

        //Safe because after validateOptions()
        $container = $(o.container);
        $container.isotope(o.isotope);

        initBtns();
    }

    function initBtns(){

        // filter items on button click
        $(o.filters).on('click', 'button', function( event ) {
            $container.isotope({ filter: $(this).attr(o.data_filter_value) });
            $(o.filters).find(" button").removeClass(o.css_filter_active);
            $(this).addClass(o.css_filter_active);
        });

        $(o.filters ).find("button["+o.data_filter_value+"='*']").addClass(o.css_filter_active);

    }

    function add( items ){ $container.isotope('insert', items ); }

    function clear(){
        $container.isotope('remove', $container.isotope('getItemElements') );
        filter("*");
    }

    function filter( filterValue ){

        $("button").removeClass(o.css_filter_active );
        $("button["+o.data_filter_value+"='"+filterValue+"']").addClass(o.css_filter_active);
        $container.isotope({ filter: filterValue });
    }

    //Public API
    return {
        getOption     : function( option ){ return o[option]; },
        init          : init,
        render        : render,
        add           : add,
        clear         : clear,
        filter        : filter
    }
}

})();