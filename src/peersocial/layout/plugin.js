define(function(require, exports, module) {

    appPlugin.consumes = ["app", "state"];
    appPlugin.provides = ["layout", "ejs"];

    var ejs = require("../lib/ejs");

    return appPlugin;
    /* global $ */
    function appPlugin(options, imports, register) {

        register(null, {
            ejs: ejs,
            layout: {
                ejs: ejs,

                init: function() {
                    // $('.navbar-nav>li>a').on('load', function(e) {
                    //     $(e).on('click', function() {
                    //         $('.navbar-collapse').collapse('hide');
                    //     });
                    // }());

                    imports.state.$hash.on("404", function(currentHash, lastHash) {
                        ejs.render(require("./404-page_not_found.html"), {
                            /* options */
                        }, { async: true }).then(function(pageOutput) {
                            $("#main-container").html(pageOutput);
                        });
                    });
                    imports.state.$hash.on("200", function(currentHash, lastHash) {
                        $("#main-container").html(ejs.render(require("./loading.html")));
                    });

                },
                get: function($selector) {
                    return $($selector);
                },
                addNavBar: function(e, clear) {
                    e = $(e);
                    e.find("a").on('click', function() {
                        $('.navbar-collapse').collapse('hide');
                    });
                    if(clear)
                        $("#navbar-nav-right").html(e);
                    else
                        $("#navbar-nav-right").prepend(e);
                }
            }
        });

    }

});