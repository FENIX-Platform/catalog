// Place third party dependencies in the lib folder
requirejs.config({
    "baseUrl": "js/lib",
    "paths": {
        catalog : "../catalog/",
        controller: "../catalog/controller",
        widgets: "../catalog/widgets",
        plugins: "../catalog/widgets/bridge/plugins",
        structures: "../structures",
        jqwidgets: "http://fenixapps.fao.org/repository/js/jqwidgets/3.1/jqx-all",
        jqueryui : "http://code.jquery.com/ui/1.10.3/jquery-ui.min"
    },
    shim : {
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