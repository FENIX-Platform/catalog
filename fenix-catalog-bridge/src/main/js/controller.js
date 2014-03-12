(function(){
    "use strict";

    //helper functions
    function handleError( e ){

        if ($.pnotify) {

            $.pnotify({
                title   : 'ERROR',
                text    : e,
                type    : 'error',
                history : false,
                nonblock: true
            });

        } else { alert(e); }

    }

    window.catalog_controller = function(){

        var html_ids, form_config, validators, result_factory, $pagination, pageDim;

        //Components
        var bridge_factory, bridge, form, grid;

        function preValidation(){

            if ($.pnotify) { $.pnotify.defaults.styling = "bootstrap3"; }

            //Components existence
            if (!Fenix_catalog_bridge_factory || typeof Fenix_catalog_bridge_factory !== "function") {
                handleError("please import Fenix_catalog_bridge_factory JS library");
            }
            if (!Fenix_catalog_demo || typeof Fenix_catalog_demo !== "function") {
                handleError("please import Fenix_catalog_demo JS library");
            }
            if (!Fenix_catalog_results_grid || typeof Fenix_catalog_results_grid !== "function") {
                handleError("please import Fenix_catalog_results_grid JS library");
            }
            if (!Fenix_catalog_result_factory || typeof Fenix_catalog_result_factory !== "function") {
                handleError("please import Fenix_catalog_result_factory JS library");
            }

        }

        function initBtns(){

            $("#getvalues").on("click", function(){

                bridge.query(form, function( s ){

                    console.log( s )

                    $.ajax({
/*                        url     : "http://hqlprfenixapp2.hq.un.fao.org:4242/catalog/search/test",*/
                        url         : "http://168.202.28.230:8001/search",
                        type        : "POST",
                        contentType : "application/json; charset=utf-8",
                        data        : s,
                        dataType    : "json",
                        context     : document.body
                    }).success(function(data, textStatus, jqXHR ) {

                        if ( data ) {

                            updatePagination(data, 1);
                            updateGrid(data, 1);

                        } else {

                            grid.clear();
                            updatePagination()

                            $.pnotify({
                                title   : 'FENIX info',
                                text    : 'Not results found',
                                type    : 'info',
                                history : false
                            });
                        }

                    }).error(function(){ handleError("Impossible to connect to FENIX Catalog");
                    });
                });
            });

        };

        function initComponents(){

            //FENIX Catalog Bridge
            bridge_factory   = new Fenix_catalog_bridge_factory();
            bridge           = bridge_factory.createBridge( {id : "fenix-catalog-bridge"} );

            //Demo Filter Form
            form = Fenix_catalog_demo();
            form.init({
                container : "#" + html_ids.FORM,
                config    : form_config,
                validators: validators
            });

            //Results Grid
            grid = Fenix_catalog_results_grid();
            grid.init({
                container   : "#" + html_ids.RESULTS,
                autorender  : true,
                isotope     : {
                    // Isotope options
                    itemSelector: '.fenix-result',
                    layoutMode  : 'fitRows'
                },
                filters     : "#" + html_ids.FILTERS
            });

            //Result factory
            result_factory = new Fenix_catalog_result_factory();

            //Pagination
            $pagination = $('#'+html_ids.PAGINATION);
            $pagination.html('<ul class="pagination"></ul>');
            $pagination = $pagination.find('ul');

        }

        function updatePagination(data, page){

            $pagination.empty();

            if (data.count > pageDim){

                for (var j = 1; j < Math.round(data.count/pageDim) + 1; j++){

                    var $p = $('<li data-page="'+j+'"><span>'+j+'</span></li>').on('click', function(){
                        $(this).html($(this).data('page')+' <span class="sr-only">(current)</span>')
                        updatePagination(data, $(this).data('page'));
                        updateGrid(data, $(this).data('page') );

                        //$pagination.find('li').removeClass('active')
                        //$(this).addClass('active')
                    })

                    $pagination.append($p)
                }

            }

        }

        function updateGrid(data, page ){

            grid.clear();

            for(var i = (page - 1) * pageDim; i < Math.min(data.resources.length, (pageDim * page) ) ; i++){

                result_factory.getInstance( {source: data.resources[i]} ).getHtml( grid.add )

            }

        }

        function init(){

            //Variables init
            html_ids = {
                FORM    : "form-container",
                FILTERS : "filters-container",
                RESULTS : "results-container",
                PAGINATION : "results-pagination"
            };

            //Init values for form
            form_config = 'json/fenix-catalog-config.json';

            preValidation();

            initComponents();
            initBtns();

            //Pagination param
            pageDim = 5;

        }

        return { init : init }
    }

}())

window.addEventListener('load', catalog_controller().init(), false);