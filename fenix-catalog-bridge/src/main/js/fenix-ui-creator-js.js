/*
 * TODO:
 * Set lang dynamically
 *
 * Review the validation method. Every ComponentType should have an array of validation fns in order
 * to do not duplicate the same validation fns
 * */

/*global window, $*/
(function(){
    "use strict";

    var errors  = {
            CONTAINER_NOT_FOUND : { EN : "FENIX UI Creator: Impossible to find container"},
            ELEMENTS_NOT_JSON   : { EN : "FENIX UI Creator: Elements JSON file not valid"},
            ELEMENTS_NOT_ARRAY  : { EN : "FENIX UI Creator: Elements JSON file not an array"},
            ELEM_NOT_ID         : { EN : "FENIX UI Creator: Specify Id for each UI element"},
            ELEM_NOT_COMP       : { EN : "FENIX UI Creator: Specify Component for each UI element"},
            ELEM_COMP_TYPE      : { EN : "FENIX UI Creator: Component Type not valid"},
            ELEM_NOT_SOURCE     : { EN : "FENIX UI Creator: Specify source for each Component"},
            ELEM_NOT_DATAFIELDS : { EN : "FENIX UI Creator: Specify Datafields for each Component"},
            VALUES_NOT_READY    : { EN : "FENIX UI Creator: Values Not Ready"},
            VALIDATORS_NOT_VALID: { EN : "FENIX UI Creator: Validators not valid"},
            DATE_FORMAT_ERROR   : { EN : "FENIX UI Creator: Date format not valid"},
            CONNECTION_FAIL     : { EN : "FENIX UI Creator: Connection problems"}
        },
        lang = 'EN',
        valid;

    //helper functions
    function handleError( e ){
        throw new Error(errors[e][lang]);
        valid = false;
    }

    //Public Component
    window.Fenix_ui_creator = function(){

        var types, langs, o, elems, v;

        //LIST
        function validateList( e ){
            if(!e.hasOwnProperty("source")) {
                handleError("ELEM_NOT_SOURCE");
            } else {
                if(!e.source.hasOwnProperty("datafields")) { handleError("ELEM_NOT_DATAFIELDS"); }
            }
        }

        function renderList( e, container ){

            var source, dataAdapter;

            // prepare the data
            source        =  $.extend({datatype: "json"}, e.component.source);
            dataAdapter   = new $.jqx.dataAdapter(source, {
                loadError: function (jqXHR, status, error) {
                    handleError("CONNECTION_FAIL");
                }
            });
            // Create a jqxListBox
            $(container).jqxListBox($.extend({ source: dataAdapter}, e.component.rendering));
        }

        function getValueList( e ){ return $("#"+ e.id).jqxListBox('val'); }

        //TREE
        function validateTree( e ){
            if(!e.hasOwnProperty("source")) { handleError("ELEM_NOT_SOURCE"); }
            else {
                if(!e.source.hasOwnProperty("datafields")) { handleError("ELEM_NOT_DATAFIELDS"); }
            }
        }

        function renderTree( e, container ){

            var source, dataAdapter, records;

            // create data adapter.
            source      =  $.extend({datatype: "json"}, e.component.source );
            dataAdapter = new $.jqx.dataAdapter(source);
            // perform Data Binding.
            dataAdapter.dataBind();
            // get the tree items. The first parameter is the item's id. The second parameter is the parent item's id.
            // The 'items' parameter represents the sub items collection name.
            // Each jqxTree item has a 'label' property, but in the JSON data, we have a 'text' field.
            // The last parameter specifies the mapping between the 'text' and 'label' fields.
            records = dataAdapter.getRecordsHierarchy('id', 'parentid', 'items', [{ name: 'text', map: 'label'}]);
            $(container).jqxTree($.extend({source: records}, e.component.rendering));
        }

        function getValueTree( e ){  return $("#"+ e.id).jqxTree('val') ? $("#"+ e.id).jqxTree('val').value : null;  }

        //DYNAMICTREE
        function validateDynamicTree( e ){
            /*if(!e.hasOwnProperty("source")) {handleError("ELEM_NOT_SOURCE");}
             else {
             if(!e.source.hasOwnProperty("datafields")) handleError("ELEM_NOT_DATAFIELDS");
             }*/
        }

        function renderDynamicTree( e, container ){

            var tree, source;

            tree = $(container);
            //Source initialized with a 'Loading...' feedback for users.
            source = [{ label : "Loading...", disabled : true}];
            $.ajax({
                dataType: "json",
                async: true,
                url: e.url+"?levels=1",
                success: function (data, status, xhr) {
                    tree.jqxListBox('removeAt', 0 );
                    $.each(data, function(index, element){
                        element.label = element.title[lang];
                        element.value = element.code;
                        element.items = [{
                            value: element.code,
                            disabled : true,
                            label:"Loading..."
                        }];
                    });
                    source = data;
                    tree.jqxTree({ source: source });
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    handleError("CONNECTION_FAIL");
                }
            });
            tree.jqxTree($.extend({source: source}, e.component.rendering ));
            tree.on('expand', {e: e}, function (event) {
                var label, $element, loader, loaderItem, children;

                label = tree.jqxTree('getItem', event.args.element).label;
                $element = $(event.args.element);
                loader = false;
                loaderItem = null;
                children = $element.find('ul:first').children();
                $.each(children, function() {
                    var item;
                    item = tree.jqxTree('getItem', this);
                    if (item && item.label === 'Loading...') {
                        loaderItem = item;
                        loader = true;
                        return false;
                    }
                });
                if (loader) {
                    $.ajax({
                        dataType: "json",
                        async: true,
                        url: e.url + loaderItem.value + "?levels=1",
                        success: function (d, status, xhr) {
                            var data = d.childs;
                            if (data){
                                $.each(data, function(index, element){
                                    element.label = element.title[lang];
                                    element.value = element.code;
                                    if (event.data.e.maxlevels > element.level){

                                        element.items = [{
                                            value: element.code,
                                            disabled : true,
                                            label:"Loading..."
                                        }];
                                    }
                                });

                                tree.jqxTree('addTo', data, $element[0]);
                            }
                            tree.jqxTree('removeItem', loaderItem.element);
                        }
                    });
                }
            });
            tree.on('select', function (event) {
                var args, item, label, code;
                args = event.args;
                item = tree.jqxTree('getItem', args.element);
                label = item.label;
                code = item.value;
            });
        }

        //FREETEXT
        function renderFreeText( e, container ){

            var text = document.createElement('INPUT');
            text.setAttribute("type", "TEXT");

            if(e.component.hasOwnProperty("rendering")){
                if(e.component.rendering.hasOwnProperty("placeholder")){

                    if (e.component.rendering.placeholder.hasOwnProperty(lang)){
                        text.setAttribute("placeholder", e.component.rendering.placeholder[lang]);
                    } else {
                        text.setAttribute("placeholder", e.component.rendering.placeholder['EN']);
                    }
                }
            }

            if (e.component.rendering.hasOwnProperty("htmlattributes")){

                Object.keys(e.component.rendering.htmlattributes).forEach(function( entry ) {
                    text[entry] = e.component.rendering.htmlattributes[entry];
                });

            }

            $(container).append(text);
        }

        function getValueFreeText( e ){ return $("#" + e.id + " > input").val();  }

        //DROPDOWN
        function validateDropdown( e ){
            if(!e.hasOwnProperty("source")) {handleError("ELEM_NOT_SOURCE");}
            else {
                if(!e.source.hasOwnProperty("datafields")) { handleError("ELEM_NOT_DATAFIELDS"); }
            }
        }

        function renderDropdown( e, container ){

            var source, dataAdapter;

            // prepare the data
            source = $.extend({datatype: "json"}, e.component.source);
            dataAdapter = new $.jqx.dataAdapter(source);
            // Create a jqxDropDownList
            $(container).jqxDropDownList($.extend({ source: dataAdapter}, e.component.rendering));
        }

        function getValueDropdown( e ){  return $("#"+ e.id).jqxDropDownList('val'); }

        //SIMPLE RANGE
        function validateSimpleRange( e ){ }

        function renderSimpleRange( e, container ){

            // create rangeSlider.
            $(container).rangeSlider( $.extend(e.component.rendering, e.component.source) );
        }

        function getValueSimpleRange( e ){ return $("#"+ e.id).rangeSlider("values"); }

        //DATE RANGE
        function validateDateRange( e ){ }

        function renderDateRange( e, container ){

            // create jqxRangeSelector.
            $(container).dateRangeSlider( $.extend(e.component.rendering, e.component.source) );
        }

        function getValueDateRange( e ){  return $("#"+ e.id).dateRangeSlider("values"); }

        //Validation fns
        function inputValidation(){

            //Existing container
            if (!document.querySelector(o.container)) { handleError("CONTAINER_NOT_FOUND"); }

            //valid JSON Source
            try { JSON.parse(o.elements); } catch(e) { handleError("ELEMENTS_NOT_JSON"); }

            //Source as Array
            if (JSON.parse(o.elements).length === undefined ) { handleError("ELEMENTS_NOT_ARRAY"); }

            //UI valid lang
            if (o.lang && langs.indexOf(o.lang.toUpperCase()) > 0) { lang = o.lang.toUpperCase(); }

            return valid;
        }

        function validateElement( e ){

            //ID
            if(!e.hasOwnProperty("id")) { handleError("ELEM_NOT_ID"); }

            //Valid component
            if(!e.hasOwnProperty("component")) { handleError("ELEM_NOT_COMP"); }

            //Component Type
            if (!types[e.type.toUpperCase()]) { handleError("ELEM_COMP_TYPE");}
            else {
                if (types[e.type.toUpperCase()].validate) { types[e.type.toUpperCase()].validate( e.component ); }
            }

            return valid;
        }

        function getValidation( values ){

            var result = {}, propertyErrors, property, validatorName, e;

            if (o.validators){
                if (typeof o.validators !== "object") { handleError("VALIDATORS_NOT_VALID"); }
                else {

                    //Loop over validations
                    for( property in o.validators ) {

                        propertyErrors = { errors : {} };

                        if ( o.validators.hasOwnProperty(property) ) {

                            for ( validatorName in o.validators[property]){

                                if (o.validators[property].hasOwnProperty(validatorName)) {

                                    e = o.validators[property][validatorName]( values[property] );

                                    if ( e !== true) { propertyErrors.errors[validatorName]= e ; }

                                }
                            }
                        }

                        if ( Object.keys(propertyErrors.errors).length > 0 ) {

                            propertyErrors.value = values[property];
                            result[property] = propertyErrors;

                        }
                    }
                }
            }

            return Object.keys(result).length === 0  ? null : result;
        }

        //Get Values
        function getValues( validate, externalElements ){

            var result = {}, i;

            if (externalElements){

                //Loop on external elements to get values
                for (i = 0; i < externalElements.length; i++){
                    result[externalElements[i].id] = types[externalElements[i].type.toUpperCase()].getValue( externalElements[i] );
                }

            } else {
                //Looping on initial elements
                if (elems === undefined) { handleError( "VALUES_NOT_READY" ); }

                //Loop on source elements to get values
                for (i = 0; i < elems.length; i++){
                    result[elems[i].id] = types[elems[i].type.toUpperCase()].getValue( elems[i] );
                }

            }

            v = validate === undefined || validate === false ? null : getValidation( result );
            if (v) { throw new Error(v); }

            return result;
        }

        function validate(){ return getValidation( getValues() ); }

        //Rendering fns
        function createElement(e, container ){

            console.log("Element container "+container)

            var div, label, c;

            c = document.getElementById(e.container);

            if (!c){

                c = document.createElement("DIV");
                c.setAttribute("id", e.container);
                console.log("Container doesn't exist. id: "+e.container)
                if (e.cssclass) { c.setAttribute( "class", e.cssclass ); }

            }

            if (e.label[lang]) {

                label = document.createElement("label");
                label.setAttribute("for", e.id);
                label.innerHTML = e.label[lang];
                c.appendChild(label);

                div = document.createElement("DIV");
                div.setAttribute("id", e.id);
                c.appendChild(div);

                document.querySelector(container).appendChild(c);

            }  else {

                div = document.createElement("DIV");
                div.setAttribute("id", e.id);
                if (e.cssclass) { div.setAttribute( "class", e.cssclass ); }

                document.querySelector(container).appendChild(div);
            }

            // Invoke the ad-hoc render function of current Component Type
            types[e.type.toUpperCase()].render( e, div );
        }

        function init(){

            types = {
                LIST : {
                    validate : validateList,
                    render   : renderList,
                    getValue : getValueList
                },
                TREE :  {
                    validate : validateTree,
                    render   : renderTree,
                    getValue : getValueTree
                },
                DYNAMICTREE : {
                    validate : validateDynamicTree,
                    render   : renderDynamicTree,
                    getValue : getValueTree
                },
                FREETEXT :  {
                    render   : renderFreeText,
                    getValue : getValueFreeText
                },
                DROPDOWN : {
                    validate : validateDropdown,
                    render   : renderDropdown,
                    getValue : getValueDropdown
                },
                SIMPLERANGE : {
                    validate : validateSimpleRange,
                    render   : renderSimpleRange,
                    getValue : getValueSimpleRange
                },
                DATERANGE : {
                    validate : validateDateRange,
                    render   : renderDateRange,
                    getValue : getValueDateRange
                }
            };
            langs = ["EN", "FR", "ES"];
            //Component options
            o = { };
        }

        function render( options ){

            var i;

            init();

            $.extend(o, options);
            valid = true;

            console.log("prima vali")
            if ( inputValidation() ){

                console.log("validation successful")

                elems = JSON.parse(o.elements);

                //Loop on source elements. If valid Element -> render it
                for (i = 0; i < elems.length; i++){

                    console.log("UI Elements Loop")
                    console.log(elems[i])

                    if ( validateElement(elems[i]) ){ createElement(elems[i], o.container); }
                }
            }
        }

        //Public API
        return {
            render    : render,
            getValues : getValues,
            validate  : validate
        };
    };

}());