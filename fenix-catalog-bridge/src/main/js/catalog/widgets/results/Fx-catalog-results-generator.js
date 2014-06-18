define([
    "fx-cat-br/widgets/results/renderers/Fx-result-renderer-dataset",
    "fx-cat-br/widgets/results/renderers/Fx-result-renderer-layer"
], function (Dataset, Layer) {

    function Fx_catalog_results_generator() {
    }

    Fx_catalog_results_generator.prototype.getInstance = function (options) {

        switch (options.resourceType.toUpperCase()) {
            case "DATASET" :
                return new Dataset(options).getHtml();
                break;
            case "CODELIST" :
                //return new Fenix_catalog_result_codelist( options );
                break;
            case "LAYER" :
                return new Layer(options).getHtml();
                break;
        }
    };

    return Fx_catalog_results_generator;

});