define(["jquery"], function ($) {

    var lang = 'EN';

    function Fx_ui_w_Name() {
    };

    Fx_ui_w_Name.prototype.validate = function (e) {
        return true;
    };

    Fx_ui_w_Name.prototype.render = function (e, container) {

        var text = document.createElement('INPUT');
        text.setAttribute("type", "TEXT");

        if (e.component.hasOwnProperty("rendering")) {
            if (e.component.rendering.hasOwnProperty("placeholder")) {

                if (e.component.rendering.placeholder.hasOwnProperty(lang)) {
                    text.setAttribute("placeholder", e.component.rendering.placeholder[lang]);
                } else {
                    text.setAttribute("placeholder", e.component.rendering.placeholder['EN']);
                }
            }
        }

        if (e.component.rendering.hasOwnProperty("htmlattributes")) {

            Object.keys(e.component.rendering.htmlattributes).forEach(function (entry) {
                text[entry] = e.component.rendering.htmlattributes[entry];
            });

        }

        $(container).append(text);
    };

    Fx_ui_w_Name.prototype.getValue = function (e) {
        return [{ enumeration :  $("#" + e.id + " > input").val()}];
    };

    return Fx_ui_w_Name;
});