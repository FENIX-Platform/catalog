({
    baseUrl: '../src/main/js/lib',
    paths: {
        json: "../../resources/json",
        html: "../../resources/html",
        requireLib: "require"
    },
    mainConfigFile: '../src/main/js/main.js',
    name: '../index',
    out: '../src/main/js/catalog.min.js',
    preserveLicenseComments: false,
    include: 'requireLib'

})