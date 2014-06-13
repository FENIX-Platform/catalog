/*global define */

define(['nprogress', 'pnotify', 'pnotify.nonblock'], function (NProgress, PNotify) {

    function PageController() {
    }

    //(injected)
    PageController.prototype.filter = undefined;

    //(injected)
    PageController.prototype.bridge = undefined;

    //(injected)
    PageController.prototype.results = undefined;

    PageController.prototype.renderComponents = function () {
        var self = this;

        self.filter.render();
        self.results.render();
    };

    PageController.prototype.initEventListeners = function () {

        var self = this;

        document.body.addEventListener("submit.catalog.fx", function () {
            NProgress.start();
            self.bridge.query(self.filter, self.results.addItems, self.results);
            //self.filter.collapseFilter();
        }, false);

        document.body.addEventListener("end.query.catalog.fx", function () {
            NProgress.done();
        }, false);


        document.body.addEventListener("empty_response.query.catalog.fx", function () {

            self.results.clear();

            new PNotify({
                title: 'No Result Notice',
                text: 'The request has no results',
                type: 'error',
                nonblock: {
                    nonblock: true
                }
            });
        }, false);

        //$(".fx-catalog-header-btn-close").on('click', self.filter.openFilter)

    };

    PageController.prototype.preValidation = function () {
        var self = this;

        if (!self.filter) {
            throw new Error("PAGE CONTROLLER: INVALID FILTER ITEM.")
        }
    };

    PageController.prototype.render = function () {

        this.preValidation();
        this.initEventListeners();

        this.renderComponents();
    };

    return PageController;

});