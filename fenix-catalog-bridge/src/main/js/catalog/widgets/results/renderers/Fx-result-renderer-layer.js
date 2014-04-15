
function Fenix_catalog_result_layer( options ) {

    var o = { };
    //Default Result options
    var defaultOptions = {
        s_result      : ".fenix-result",
        s_desc_title  : ".fx_result_description_title",
        s_desc_source : ".fx_result_description_source",
        s_desc_geo    : ".fx_result_description_geograficalarea",
        s_desc_period : ".fx_result_description_baseperiod",
        s_icon        : "#fx_result_icon_img",
        error_prefix  : "FENIX Result layer creation error: "
    };
    var $result;

    function initText(){

        $result.find( o.s_desc_title ).html(o.source.name);
        $result.find( o.s_desc_source ).html(o.source.source);

        $result.find( o.s_desc_geo ).html(o.source.metadata.geographicExtent.title['EN']);
        $result.find( o.s_desc_period ).html("from " + new Date(o.source.metadata.basePeriod.from).getFullYear() +" to " + new Date(o.source.metadata.basePeriod.to).getFullYear());

    };

    function initModal(){

        $result.find( "#myModalLabel").html(o.source.name);

    }

    function getHtml( callback ){

        //Merge options
        extend(o, defaultOptions);
        extend(o, options);

        $result = $(fragments).find( o.s_result );
        if ( $result.length === 0){ throw new Error( o.error_prefix + "HTML fragment not found"); }

        $result.addClass("layer");
        $result.find( o.s_icon ).attr("src","css/img/mind_map60.png");

        initText();
        initModal();

        //Check callback is a function
        if (  callback && typeof callback === "function" ){ callback( $result ); }
        else { throw new Error( o.error_prefix + "getHtml() #1 param is not a function");}

    }

    return { getHtml : getHtml }

}