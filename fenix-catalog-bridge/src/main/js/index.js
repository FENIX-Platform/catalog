// Place third party dependencies in the lib folder
requirejs.config({
    "baseUrl": "js/lib",
    "paths": {
        js : "../../js",
        json: "../../json",
        catalog: "../catalog",
        controller: "../catalog/controller",
        widgets: "../catalog/widgets",
        plugins: "../catalog/widgets/bridge/plugins",
        structures: "../structures",
        html : "../../html" ,
        jqwidgets: "http://fenixapps.fao.org/repository/js/jqwidgets/3.1/jqx-all",
        jqueryui: "http://code.jquery.com/ui/1.10.3/jquery-ui.min"
    },
    "shim": {
        "jqrangeslider": {
            deps: ["jquery", "jqueryui"]
        },
        "bootstrap": {
            deps: ["jquery"]
        }
    }
});

require(["js/IndexContext", "domReady!"], function(IndexContext) {

    var indexContext = new IndexContext();
    indexContext.init();

});