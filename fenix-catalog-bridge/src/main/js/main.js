require.config({
    baseUrl: "js",
    paths: { },
    shim: {
        "lib/jqrangeslider": {
            deps: ["jquery", "jqueryui"]
        },
        "lib/bootstrap": {
            deps: ["jquery"]
        }
    }
});

// relative or absolute path of Components' main.js
require(['./paths'], function( Catalog ) {


    // NOTE: This setTimeout() call is used because, for whatever reason, if you make
    //       a 'require' call in here or in the Cart without it, it will just hang
    //       and never actually go fetch the files in the browser. There's probably a
    //       better way to handle this, but I don't know what it is.

    setTimeout(function() {


        /*
         @param: prefix of Components paths to reference them also in absolute mode
         @param: paths to override
         @param: callback function
         */

        Catalog.initialize('./', null, function() {

            require(['./start' ], function( Starter ){

               new Starter().init({
                   container: document.querySelector('#catalogContainer')
               });

            });
        });

    }, 0);
});
