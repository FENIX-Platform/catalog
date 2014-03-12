(function () {
    "use strict";

    //helper functions
    function handleError(e) {

        if ($.pnotify) {

            $.pnotify({
                title: 'ERROR',
                text: e,
                type: 'error',
                history: false,
                nonblock: true
            });

        } else {
            alert(e);
        }

    }

    window.catalog_btn_controller = function () {

        var html_ids;

        //Components
        var plus_btn, form;

        function preValidation() {

            if ($.pnotify) {
                $.pnotify.defaults.styling = "bootstrap3";
            }

            //Components existence
            if (!Fenix_catalog_bridge_plus_btn || typeof Fenix_catalog_bridge_plus_btn !== "function") {
                handleError("please import Fenix_catalog_bridge_plus_btn JS library");
            }

            //Components existence
            if (!Fenix_catalog_bridge_modular_filter || typeof Fenix_catalog_bridge_modular_filter !== "function") {
                handleError("please import Fenix_catalog_bridge_modular_filter JS library");
            }

        }

        function initComponents() {

            //FENIX Catalog Bridge Plus btn
            plus_btn = Fenix_catalog_bridge_plus_btn();
            plus_btn.init({
                container: "#" + html_ids.PLUSBTN,
                url: "json/plus-btn-config.json"
            });

            //FENIX Catalog Bridge Plus btn
            form = Fenix_catalog_bridge_modular_filter();
            form.init({
                container: "#" + html_ids.MODULARFORM,
                url: "json/modular_form_config.json"
            });

        }

        function init() {

            //Variables init
            html_ids = {
                PLUSBTN: "plus-btn-container",
                MODULARFORM: "fx-catalog-modular-form"
            };


            preValidation();

            initListeners();

            initComponents();
        }

        function initListeners(){

            document.body.addEventListener("button_select", function(e){
                var payload = e.detail.semantic;
                console.log(payload)
                form.addItem();
            }, false);

        }

        return { init : init }
    }

}())

window.addEventListener('load', catalog_btn_controller().init(), false);