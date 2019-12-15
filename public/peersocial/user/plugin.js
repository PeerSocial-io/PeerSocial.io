define(function(require, exports, module) {

    appPlugin.consumes = ["app", "gun"];
    appPlugin.provides = ["user"];

    /* global Provable */

    var generateUID32 = function(pub) {
        return Provable.toInt(Provable.sha256(pub)).toString().substring(0, 4);
    }

    var loginModel = require("text!./login-model.html")

    return appPlugin;

    function appPlugin(options, imports, register) {

        var gun = imports.gun;

        // gun.user().recall({
        //     sessionStorage : true
        // },function(res){
        //     console.log(res)
        // })

        function userLogout() {
            gun.user().leave();

            imports.app.state.history.setHash("home");


            $("#navbar-nav-right").find("#logout_btn").remove();
            imports.app.layout.get("#navbar-nav-right").html(
                imports.app.layout.ejs.render('<li class="nav-item active" id="login_btn"><a class="nav-link" href="#login"><%= login %><span class="sr-only"></span></a></li>', { login: "Login" })
            )
            imports.app.emit("logout")
        }

        function prepLogout() {
            $("#navbar-nav-right").find("#login_btn").remove();

            imports.app.layout.get("#navbar-nav-right").html(
                imports.app.layout.ejs.render('<li class="nav-item active" id="logout_btn"><a class="nav-link" href="#logout"><%= Logout %><span class="sr-only"></span></a></li>', { Logout: "Logout" })
            )
        }

        function openLogin() {

            var model = $(loginModel)

            model.modal({
                show: true
            })

            model.on("hide.bs.modal", function() {
                if (imports.app.state.lastHash)
                    imports.app.state.hash = imports.app.state.lastHash;
                else imports.app.state.history.back();


            })
            model.on("hidden.bs.modal", () => {
                model.modal("dispose");
            })
            model.on("shown.bs.modal", () => {

                model.find("#username").focus()
            })

            model.find("#username").keyup(function(event) {
                if (event.keyCode == 13) { //enter
                    model.find("#login").click()
                }
            })
            model.find("#password").keyup(function(event) {
                if (event.keyCode == 13) { //enter
                    model.find("#login").click()
                }
            })

            model.find("#login").click(async() => {
                var usr = model.find("#username").val();
                var pas = model.find("#password").val();

                if (usr && !pas) {
                    gun.aliasToPub("@" + usr, (pub) => {
                        model.find("#username_error").text("");
                        if (pub) {
                            gun.get(pub).once((data) => {

                                console.log(data)
                                if (usr == data.alias) {
                                    model.find("#username").attr("disabled", "disabled")
                                    model.find("#pwfield").show();
                                    model.find("#password").focus()
                                }
                            });
                        }
                        else {
                            model.find("#username_error").css("color", "red").text("User Not Found")
                        }
                    })


                }
                else if (usr && pas) {
                    gun.user().auth(usr, pas, function(res) {
                        if (!res.err) {
                            if (gun.user().is) {
                                model.modal("hide")
                                prepLogout();
                                me((err, $me, $user) => {
                                    console.log("check prove number")
                                    var uid32 = generateUID32("~" + $me.pub);
                                    if (!$me.uid32 || $me.uid32 != uid32) $user.get("uid32").put(uid32)
                                    imports.app.emit("login", $me, $user)

                                })
                            }
                        }
                        else {
                            model.find("#pwfield").show();
                            model.find("#password_error").css("color", "red").text(res.err)
                        }

                    });
                }
                else {

                }

            })
        }

        function changePassword(old, pass, callback) {
            gun.user().auth(S.user.is.alias, old, (res) => {
                callback(res.err || null, res.err ? null : true);
            }, { change: pass });
        }

        function me(callback) {
            if (gun.user().is) {
                var myPubid = "~" + gun.user().is.pub;
                gun.get(myPubid).once((data) => {
                    if (data) {
                        callback(null, data, gun.get(myPubid));
                    }
                });
            }
            else callback(new Error("User Not Logged in"));
        }

        function getUser(alias, $uid32, callback) {
            if(typeof $uid32 == "function"){ callback = $uid32; $uid32 = false}
            gun.aliasToPub("@" + alias, $uid32,  (pub) => {
                if (pub) {
                    gun.get(pub).once((data) => {
                        if (alias == data.alias) {
                            callback(null, data, gun.get(pub));
                        }
                    });
                }
                else {
                    callback(new Error("User Not Found"));
                }
            });

        }

        var sessionRestored = false;
        if (window.sessionStorage.recall) {

            //console.log("restoring user session")
            gun.user().recall({
                sessionStorage: true
            }, function(res) {
                //console.log(res)
                if (!res.err) {
                    sessionRestored = true;
                }
                doRegister();
            })
        }
        else {
            gun.user().recall({
                sessionStorage: true
            })
            doRegister()
        }

        function doRegister() {

            register(null, {
                user: {
                    init: function() {

                        imports.app.state.$hash.on("login", function() {
                            if (!gun.user().is) {
                                openLogin()
                            }
                        })

                        imports.app.state.$hash.on("logout", function() {
                            userLogout();
                        })

                        imports.app.layout.get("#navbar-nav-right").append(
                            imports.app.layout.ejs.render('<li class="nav-item active" id="login_btn"><a class="nav-link" href="#login"><%= login %><span class="sr-only"></span></a></li>', { login: "Login" })
                        )

                        if (gun.user().is)
                            prepLogout()


                        imports.app.on("start", () => {
                            if (sessionRestored)
                                me((err, $me, $user) => {

                                    imports.app.emit("login", $me, $user)

                                })
                        })

                    },
                    login: function() {
                        imports.gun;

                    },
                    changePassword: changePassword,
                    me: me,
                    getUser: getUser
                }
            });

        }

    }

});