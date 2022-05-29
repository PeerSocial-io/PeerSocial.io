define(function(require, exports, module) {

    appPlugin.consumes = ["app", "state"];
    appPlugin.provides = ["layout", "ejs"];

    var ejs = require("../lib/ejs");

    return appPlugin;
    /* global $ */
    function appPlugin(options, imports, register) {

        $(document).on('DOMNodeInserted', function(e) {
            var $ta = $(e.target).find("time");
            if ($ta.length)
                $ta.timeago();

            var ddi = $(e.target).find(".dropdown-item");
            if (ddi.length)
                $(e.target).find(".dropdown-item").each((i, e) => {
                    var self = $(e);
                    self.click(() => {
                        var dropdown_id = self.closest(".dropdown-menu").attr("aria-labelledby");
                        self.closest('.navbar-collapse').collapse('hide');
                        $("#" + dropdown_id).dropdown('hide');
                    });
                });

        });
        var modal = require("./modal")(imports);
        var year = new Date().getFullYear();
        var pi_model = `<div class="modal fade" role="dialog">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">About</h5>
                <button type="button" class="close close-modal" aria-label="Close">
                  <span>&times;</span>
                </button>
              </div>
              <div class="modal-body" >
                <h3>
                    <a href="/">PeerSocial.io</a> © ${year}
                </h3>
                <h5>Funding</h5>
                <div class="funding"></div>
                <hr/>
                <h5>Contributors</h5>
                <div class="contributors"></div>
                <hr/>
                <h5>Dependencies</h5>
                <div class="dependencies"></div>
                <hr/>
                <a href="/gun/examples/stats.html">GUN-STATS</a>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary close-modal" id="cancel">Cancel</button>
              </div>
            </div>
          </div>
        </div>`;

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

                    var pi = $("<div>&#8508;</div>");
                    pi.css('position', "fixed");
                    pi.css('right', "0");
                    pi.css('bottom', "-6px");
                    pi.css('user-select', "none");
                    pi.css('cursor', "none");
                    pi.click((e) => {
                        if (e.ctrlKey && e.shiftKey) {
                            var model = imports.app.layout.modal(pi_model);
                            var $funding = model.find(".funding");
                            var funding = imports.app.package.funding;
                            for(var i in funding){
                                $funding.append(`<div><a href="${funding[i].url}">${funding[i].type}</a></div>`)
                            }
                            
                            var $contributors = model.find(".contributors");
                            var contributors = imports.app.package.contributors;
                            for(var i in contributors){
                                $contributors.append(`<div><a href="${contributors[i].url}">${contributors[i].name}</a></div>`)
                            }
                            
                            var $dependencies = model.find(".dependencies");
                            var dependencies = imports.app.package.dependencies;
                            for(var i in dependencies){
                                $dependencies.append(`<div>${i} : ${dependencies[i]}</div>`)
                            }
                            
                            // $("#app-footer").toggleClass("d-none");
                        }
                    });
                    $(document.body).append(pi);

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
                modal: modal,
                get: function($selector) {
                    return $($selector);
                },
                addNavBar: function(e, clear) {
                    e = $(e);
                    e.find("a").on('click', function(e) {
                        if (!$(e.target).hasClass("dropdown-toggle"))
                            $('.navbar-collapse').collapse('hide');
                    });
                    if (clear)
                        $("#navbar-nav-right").html(e);
                    else
                        $("#navbar-nav-right").prepend(e);

                    return e;
                }
            }
        });

    }

});