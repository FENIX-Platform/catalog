define([
    "jquery"
], function ($) {

    var lang = 'EN';

    function Fx_ui_w_ResourcesType() { }

    Fx_ui_w_ResourcesType.prototype.validate = function () {
        return true;
    };

    Fx_ui_w_ResourcesType.prototype.render = function (e, container) {

        if (e.hasOwnProperty("component")){
            if (e.component.hasOwnProperty("choices")){
                var choices = e.component.choices,
                    $form = $("<form></form>");

                for (var i = 0; i<choices.length; i++){

                    var id = Math.random(),
                        $label = $('<label for="fx-radio-'+id+'">'+ choices[i].label[lang]+'</label>'),
                        $radio = $('<input id="fx-radio-'+id+'" type="radio" name="'+ e.component.name+'" value="'+choices[i].value+'"/>');
                    $form.append($label).append($radio);
                }

                $(container).append($form);
            }
        }
    };

    Fx_ui_w_ResourcesType.prototype.getValue = function (e) {
        var result = $('#'+e.id).find('input[type=radio]:checked').val();
        return  result.split(",");
    };

    return Fx_ui_w_ResourcesType;
});