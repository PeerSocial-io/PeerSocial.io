/* global $ */

module.exports = function(imports) {
    var gun = imports.gun;

    var generateUID32 = function(pub) {
        return imports.provable.toInt(imports.provable.sha256(pub)).toString().substring(0, 4);
    };

    var ONLYKEY = require("@trustcrypto/node-onlykey/src/onlykey-api");

    var loginModel = require("./login-model.html");

    var login = {};

    //a key to let our app know if the session was restored
    var sessionRestored = false;

    Object.defineProperty(login, 'sessionRestored', {
        get() {
            return sessionRestored;
        }
    });


    Object.defineProperty(login, 'user', {
        get() {
            if (gun.user().is) 
                return gun.user();
            else
                return false;
        }
    });



    login.restoreSession = (done) => {
        imports.app.on("start", () => {
            if (login.sessionRestored && login.user) {
                imports.app.emit("login", login.user);
            }
        });

        //check if there is a session to restore
        if (window.sessionStorage.recall) {

            //we have a session to restore so lets restore it
            gun.user().recall({
                sessionStorage: true
            }, function(res) {

                if (!res.err) { //we did not get a error on the return
                    //set app key to say it was restored
                    sessionRestored = true;
                }

                //now gun.user().is should be populated
                //finish your app startup
                done();
            });
        }
        else {
            //we did not have a session to restore, so lets tell the the next session login to save
            gun.user().recall({
                sessionStorage: true
            });
            //finish your app startup
            done();
        }

    };

    login.prepLogin = function() {
        $("#navbar-nav-right").append(
            imports.app.layout.ejs.render('<li class="nav-item active" id="login_btn"><a class="nav-link" href="/login"><%= login %><span class="sr-only"></span></a></li>', { login: "Login" })
        );
    };

    login.prepLogout = function() {
        $("#navbar-nav-right").find("#login_btn").remove();

        $("#navbar-nav-right").html(
            imports.app.layout.ejs.render('<li class="nav-item active" id="logout_btn"><a class="nav-link" href="/logout"><%= Logout %><span class="sr-only"></span></a></li>', { Logout: "Logout" })
        );
    };

    login.openLogin = function(done) {

        var model = $(loginModel);

        model.modal({
            show: true,
            backdrop: 'static',
            keyboard: false
        });

        model.on("hide.bs.modal", function() {
            if(done) return done();
            if (imports.app.state.lastHash)
                imports.app.state.hash = imports.app.state.lastHash;
            else {
                if(imports.app.state.history.length > 0)
                    imports.app.state.history.back();
                else{
                    imports.app.state.hash = "home";
                }
            }
        });
        model.on("hidden.bs.modal", () => {
            model.modal("dispose");
            model.remove();
        });
        model.on("shown.bs.modal", () => {

            model.find("#username").focus();
        });

        model.find("#username").keyup(function(event) {
            if (event.keyCode == 13) { //enter
                model.find("#login").click();
            }
        });
        model.find("#password").keyup(function(event) {
            if (event.keyCode == 13) { //enter
                model.find("#login").click();
            }
        });

        var createAccount = false;
        var creating = false;

        var $login_hardware = async(usr, pas, pasconfm) => {
            if (!imports.app.nw_app || !imports.app.nw_app.is_localhost)
                ONLYKEY((OK) => {
                    var ok = OK();
                    ok_login(ok);
                });
            else
                ok_login(imports.app.nw_app.onlykey);

            function ok_login(ok) {
                ok.derive_public_key(usr, 1, false, (err, key) => {
                    ok.derive_shared_secret(pas, key, 1, false, (err, sharedsec, key2) => {
                        $login(usr, sharedsec, pasconfm ? (pasconfm == pas ? sharedsec : pasconfm) : false);
                    });
                });
            }
        };

        var $login = async(usr, pas, pasconfm) => {
            if (creating) return;

            model.find("#password_error").text("");
            model.find("#confirm-password_error").text("");

            if (pasconfm) {
                if (!(pasconfm == pas && usr == createAccount)) {
                    model.find("#password_error").css("color", "red").html("<b>Passwords Do Not Match</a>");
                    model.find("#confirm-password_error").css("color", "red").html("<b>Passwords Do Not Match</a>");
                    return;
                }
                else {
                    if (!(usr == createAccount)) {
                        createAccount = false;
                        pasconfm = "";
                        model.find("#password_error").text("");
                        model.find("#confirm-password_error").text("");
                        model.find("#confirm-password").val("");
                        model.find("#confirmpwfield").hide();
                    }
                }
            }

            if (usr && pas) {
                gun.user().auth(usr, pas, function(res) {
                    if (!res.err) {
                        if (login.user) {
                            model.modal("hide");
                            login.prepLogout();
                            // me((err, $me, $user) => {
                            //     if (err) console.log(err);
                            //     var uid32 = generateUID32("~" + $me.pub);
                            //     if (!$me.uid32 || $me.uid32 != uid32) $user.get("uid32").put(uid32);
                            imports.app.emit("login", login.user);

                            // });
                        }
                    }
                    else {
                        if (res.err == "Wrong user or password.") {
                            var uid = false;
                            if (usr.indexOf("#") > -1) {
                                usr = usr.split("#");
                                uid = usr[1];
                                usr = usr[0];
                            }
                            gun.aliasToPub("@" + usr, uid, (pub) => {
                                if (!pub) {
                                    if (createAccount && !creating) {
                                        creating = true;
                                        gun.user().create(usr, pas, function(ack) {
                                            if (ack.pub) {
                                                creating = false;
                                                $login(usr, pas);
                                            }
                                        }, {
                                            already: true
                                        });
                                    }
                                    else {
                                        model.find("#password_error").css("color", "red").html("<b>User not created.</b>&nbsp;<a href='#login' id='create'>Create User?</a>");
                                        var create = model.find("#password_error").find("#create");
                                        create.click(function() {
                                            model.find("#confirmpwfield").show();
                                            model.find("#login").text("Create Account");
                                            model.find("#password_error").text("");
                                            createAccount = usr;
                                        });
                                    }
                                }
                                else {
                                    model.find("#password_error").css("color", "red").html("<b>" + res.err + "</b>");
                                }
                            });
                        }
                    }

                });
            }

        };

        model.find("#login").click(() => {
            var usr = model.find("#username").val();
            var pas = model.find("#password").val();
            var pasconfm = model.find("#confirm-password").val();
            $login(usr, pas, pasconfm);
        });

        model.find("#hardware_key").click(() => {
            var usr = model.find("#username").val();
            var pas = model.find("#password").val();
            var pasconfm = model.find("#confirm-password").val();
            $login_hardware(usr, pas, pasconfm);
        });
    };

    login.userLogout = function() {
        gun.user().leave();
        setTimeout(function() {
            window.location = "/";
        });
    };


    return login;
};
