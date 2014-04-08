// Place third party dependencies in the lib folder
requirejs.config({
    "baseUrl": "js/lib",
    "paths": {
        catalog : "../catalog/modular",
        controller: "../catalog/modular/controller",
        widgets: "../catalog/modular/widgets",
        jqwidgets: "http://fenixapps.fao.org/repository/js/jqwidgets/3.1/jqx-all",
        jqueryui : "http://code.jquery.com/ui/1.10.3/jquery-ui.min"
    },
    shim : {
        "jquery.sortable" : {
            deps: ["jquery"],
            export : "jQuery.fn.sortable"
        },
        "jqrangeslider" : {
            deps: ["jquery", "jqueryui"]
        },
        "bootstrap" : {
            deps: ["jquery"]
        }
    }
});

require(["catalog/IndexContext", "domReady!"], function(IndexContext){

    var indexContext = new IndexContext();
    indexContext.init();

});