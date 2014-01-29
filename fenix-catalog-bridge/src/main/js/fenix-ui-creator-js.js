(function(){

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
          VALIDATORS_NOT_VALID: { EN : "FENIX UI Creator: Validators not valid"}
      },
      lang = 'EN',
      valid;

  //helper functions
  function handleError( e ){
        alert(errors[e][lang]);
        valid = false;
    }

  //Public Component
  window.fenix_ui_creator = function(){

      var //Allowed Element Types
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
                  getValue : getValueDynamicTree
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
              RANGE : {
                  render   : renderRange,
                  getValue : getValueRange
              }
            },
          langs = ["EN", "FR", "ES"],
          //Component options
          o = {
            e_single_validation_err : "single_validation_error.ui_creator.widgets.fenix",
            e_final_validation_err  : "final_validation_error.ui_creator.widgets.fenix"
          },
          elems;

      function getValues( validate ){

          if (elems === undefined) handleError( "VALUES_NOT_READY");

          var result = {};

          //Loop on source elements to get value
          for (var i = 0; i < elems.length; i++){
              result[elems[i].id] = types[elems[i].type.toUpperCase()].getValue( elems[i] );
          }

          var v = validate === undefined || validate === false ? null : getValidation( result );
          if (v) throw v;

          return result;
      }

      function render( options ){

          $.extend(o, options);
          valid = true;

          if ( inputValidation() ){

              elems = JSON.parse(o.elements);

              //Loop on source elements. If valid Element -> render it
              for (var i = 0; i < elems.length; i++){
                  if (validateElement(elems[i])) createElement(elems[i], o.container)
              }
          }
      }

      function createElement(e, container ){

          var div = document.createElement("DIV");
          div.setAttribute("id", e.id);
          if (e.class)  div.setAttribute( "class", e.class );

          //Print label if exists
          if (e.label[lang]) {
              var label = document.createElement("label");
              label.setAttribute("for", e.id);
              label.innerHTML = e.label[lang];
              document.querySelector(container).appendChild(label);
          }

          document.querySelector(container).appendChild(div);

          // Invoke the ad-hoc render function of current Component Type
          types[e.type.toUpperCase()].render(e, div );
      }

      //Validation fns
      function inputValidation(){

          //Existing container
          if (!document.querySelector(o.container)) handleError("CONTAINER_NOT_FOUND");

          //valid JSON Source
          try { JSON.parse(o.elements) } catch(e) { handleError("ELEMENTS_NOT_JSON") }

          //Source as Array
          if (JSON.parse(o.elements).length === undefined ) handleError("ELEMENTS_NOT_ARRAY");

          //UI valid lang
          if (o.lang && langs.indexOf(o.lang.toUpperCase()) > 0) lang = o.lang.toUpperCase();

          return valid;

      }

      function validateElement( e ){

          //ID
          if(!e.id) handleError("ELEM_NOT_ID");

          //Valid component
          if(!e.component) handleError("ELEM_NOT_COMP");

          //Component Type
          if (!types[e.type.toUpperCase()]) { handleError("ELEM_COMP_TYPE");}
          else {
              if (types[e.type.toUpperCase()].validate)
                  types[e.type.toUpperCase()].validate( e.component )
          }

          return valid;

      }

      function validate(){

          return getValidation( getValues() );
      }

      function getValidation( values ){

          var result = {};

          if (o.validators){
              if (typeof o.validators !== "object") { handleError("VALIDATORS_NOT_VALID"); }
              else {

                  //Loop over validations
                  for( var property in o.validators ) {

                      var propertyErrors = { errors : {} };

                      if ( o.validators.hasOwnProperty(property) ) {

                          for ( var validatorName in o.validators[property]){

                              if (o.validators[property].hasOwnProperty(validatorName)) {

                                  var e = o.validators[property][validatorName]( values[property] );

                                  if ( e !== true) propertyErrors.errors[validatorName]= e ;

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

      //LIST
      function validateList( e ){
          if(!e.source) {handleError("ELEM_NOT_SOURCE");}
          else {
              if(!e.source.datafields) handleError("ELEM_NOT_DATAFIELDS");
          }
      }

      function renderList( e, container ){

          // prepare the data
          var source        =  $.extend({datatype: "json"}, e.component.source);
          var dataAdapter   = new $.jqx.dataAdapter(source);
          // Create a jqxListBox
          $(container).jqxListBox($.extend({ source: dataAdapter}, e.component.rendering));
      }

      function getValueList( e ){ return $("#"+ e.id).jqxListBox('val'); }

      //TREE
      function validateTree( e ){
          if(!e.source) {handleError("ELEM_NOT_SOURCE");}
          else {
              if(!e.source.datafields) handleError("ELEM_NOT_DATAFIELDS");
          }
      }

      function renderTree( e, container ){

          // create data adapter.
          var source      =  $.extend({datatype: "json"}, e.component.source );
          var dataAdapter = new $.jqx.dataAdapter(source);
          // perform Data Binding.
          dataAdapter.dataBind();
          // get the tree items. The first parameter is the item's id. The second parameter is the parent item's id.
          // The 'items' parameter represents the sub items collection name.
          // Each jqxTree item has a 'label' property, but in the JSON data, we have a 'text' field.
          // The last parameter specifies the mapping between the 'text' and 'label' fields.
          var records = dataAdapter.getRecordsHierarchy('id', 'parentid', 'items', [{ name: 'text', map: 'label'}]);
          $(container).jqxTree($.extend({source: records}, e.component.rendering));
      }

      function getValueTree( e ){
          return $("#"+ e.id).jqxTree('val') ? $("#"+ e.id).jqxTree('val').value : null;
      }

      //DYNAMICTREE
      function validateDynamicTree( e ){
          /*if(!e.source) {handleError("ELEM_NOT_SOURCE");}
          else {
              if(!e.source.datafields) handleError("ELEM_NOT_DATAFIELDS");
          }*/
      }

      function renderDynamicTree( e, container ){

          var tree = $(container);
          //Source initialized with a Loading... feedback for users.
          var source = [{ label : "Loading...", disabled : true}];
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
                  })
                  source = data;
                  tree.jqxTree({ source: source });
              },
              error: function (xhr, ajaxOptions, thrownError) {
                  console.log(xhr.status);
                  console.log(thrownError);
              }
          });
          tree.jqxTree($.extend({source: source}, e.component.rendering ));
          tree.on('expand', {e: e}, function (event) {
              var label = tree.jqxTree('getItem', event.args.element).label;
                  var $element = $(event.args.element);
                  var loader = false;
                  var loaderItem = null;
                  var children = $element.find('ul:first').children();
                  $.each(children, function() {
                      var item = tree.jqxTree('getItem', this);
                      if (item && item.label == 'Loading...') {
                          loaderItem = item;
                          loader = true;
                          return false
                      };
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
                                      if (event.data.e.maxlevels > element.level)
                                      element.items = [{
                                          value: element.code,
                                          disabled : true,
                                          label:"Loading..."
                                      }];
                                  })

                                  tree.jqxTree('addTo', data, $element[0]);
                              }
                              tree.jqxTree('removeItem', loaderItem.element);

                          }
                      });
                  }
          });
          tree.on('select', function (event) {
              var args = event.args;
              var item = tree.jqxTree('getItem', args.element);
              var label = item.label;
              var code = item.value;
              if (code) console.log(label +" "+ code)
          });

      }

      function getValueDynamicTree( e ){
          return $("#"+ e.id).jqxTree('val') ? $("#"+ e.id).jqxTree('val').value : null;
      }

      //FREETEXT
      function renderFreeText( e, container ){

         var text = document.createElement('INPUT');
         text.setAttribute("type", "TEXT");

         //Loop over the component attributes
         Object.keys(e.component.rendering).forEach(function( entry ) {
             text.setAttribute(entry,e.component.rendering[entry]);
         });

         $(container).append(text);
      }

      function getValueFreeText( e ){ return $("#" + e.id + " > input").val()  }

      //DROPDOWN
      function validateDropdown( e ){
          if(!e.source) {handleError("ELEM_NOT_SOURCE");}
          else {
              if(!e.source.datafields) handleError("ELEM_NOT_DATAFIELDS");
          }
      }

      function renderDropdown( e, container ){

          // prepare the data
          var source = $.extend({datatype: "json"}, e.component.source);

          var dataAdapter = new $.jqx.dataAdapter(source);
          // Create a jqxDropDownList
          $(container).jqxDropDownList($.extend({ source: dataAdapter}, e.component.rendering));

      }

      function getValueDropdown( e ){  return $("#"+ e.id).jqxDropDownList('val')  }

      //RANGE
      function renderRange( e, container ){

          //$(container).jqxSlider($.extend(e.component.rendering, e.component.source));

          // create jqxRangeSelector.
          $(container).jqxRangeSelector($.extend(e.component.rendering, e.component.source));
      }

      function getValueRange( e ){  return $("#"+ e.id).jqxRangeSelector("getRange"); }

      //Public API
      return {
          render    : render,
          getValues : getValues,
          validate  : validate
      }
  }

})();