/* global $ */

module.exports = function(imports) {
    var gun = imports.gun;
    var SEA = imports.gun.SEA;

    /*
    SEA.name = (async(cb, opt) => {
        try {
            if (cb) { try { cb() } catch (e) { console.log(e) } }
            return;
        }
        catch (e) {
            console.log(e);
            SEA.err = e;
            if (SEA.throw) { throw e }
            if (cb) { cb() }
            return;
        }
    });
    */

    // var generateUID32 = function(pub) {
    //     return imports.provable.toInt(imports.provable.sha256(pub)).toString().substring(0, 4);
    // };

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
                return function() {
                    return gun.user();
                };
            else
                return false;
        }
    });

    Object.defineProperty(login, 'user_cert', {
        set(query) {
            if (gun.user().is) {
                gun.user().is.cert = query;
            }
        }
    });

    login.restoreSession = (done) => {
        imports.app.on("start", () => {
            imports.app.on("login", function() {
                gun.user().get("profile").get("seen").put(new Date().getTime());
            });
            if (login.sessionRestored && login.user) {
                imports.app.emit("login", login.user);
            }
        });

        if (login.will_authorize) return done();

        //check if there is a session to restore
        if (window.sessionStorage.recall) {

            //we have a session to restore so lets restore it
            gun.user().recall({
                sessionStorage: true
            }, function(res) {

                if (!res.err) { //we did not get a error on the return
                    //set app key to say it was restored
                    sessionRestored = true;
                    // gun.user().get("profile").get("seen").put(new Date().getTime());
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
        login.menu = imports.layout.addNavBar(
            imports.app.layout.ejs.render('<li class="nav-item active" id="login_btn"><a class="nav-link" href="/login"><%= login %><span class="sr-only"></span></a></li>', { login: "Login" }), true
        );
    };

    // login.menu = false;

    login.prepLogout = function() {
        // imports.layout.addNavBar(
        //     imports.app.layout.ejs.render('<li class="nav-item active" id="logout_btn"><a class="nav-link" href="/logout"><%= Logout %><span class="sr-only"></span></a></li>', { Logout: "Logout" }), true
        // );

        login.menu = imports.layout.addNavBar(`<li class="nav-item dropdown active">
        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <img class="user-avatar rounded-circle" style="max-width: 32px;" src="https://ssl.gstatic.com/accounts/ui/avatar_2x.png">
        </a>
        <div class="dropdown-menu dropdown-menu-right text-center" aria-labelledby="navbarDropdown">
          <a class="dropdown-item" href="/profile">Profile</a>
          <a class="dropdown-item" href="/posts">Posts</a>
          <a class="dropdown-item" href="/peers">Peers</a>
          <div class="dropdown-divider"></div>
          <a class="dropdown-item" href="/logout">Logout</a>
        </div>
      </li>`, {}, true);

    };

    login.openLogin = function(done, onDestroy) {
        // var done;
        var canceled = false;
        
        var model = imports.app.layout.modal(loginModel, {
            close: () => {
                if (done)
                    return done(canceled);
                imports.app.state.history.back();
            }
        });

        var createAccount = false;
        var creating = false;
        var creatingPair = false;

        if (onDestroy)
            onDestroy(function() {
                model.close();
            });


        model.find(".close-modal").click(function() {
            if (!createAccount) {
                canceled = true;
                model.modal('hide');
            }
            else {
                createAccount = false;
                model.find(".error").text("");
                model.find("#confirmpwfield").hide().val("");
                model.find("#password").val("");
                model.find("#login_alias").text("Login");
            }
        });

        model.find("#auth_apparatus").change(function() {
            if (createAccount)
                model.find("#cancel").click();

            model.find(".error").text("");

            model.find("#pubkey").attr("type", "password");

            var value = $(this).val();

            model.find(".login_ALIAS").hide();
            model.find(".login_ONLYKEY-USB").hide();
            model.find(".login_PUBKEY").hide();

            model.find(".login_" + value).show();

        });
        model.find("#auth_apparatus").change();

        model.find("#username").keyup(function(event) {
            if (event.keyCode == 13) { //enter
                model.find("#login_alias").click();
            }
        });
        model.find("#password").keyup(function(event) {
            if (event.keyCode == 13) { //enter
                model.find("#login_alias").click();
            }
        });

        model.find("#tag").keyup(function(event) {
            if (event.keyCode == 13) { //enter
                model.find("#login_onlykey-usb").click();
            }
        });

        var $login_pubkey = async(pair) => {
            model.find("#pubkey").attr("type", "password");

            try {
                if (pair == "") throw ("Faile to load Key")
                pair = JSON.parse(pair);
            }
            catch (e) {
                // model.find(".error").text("Faile to load Key");
                model.find(".error").css("color", "red").html("<b>Faile to load Key.</b>&nbsp;<a href='javascript:' id='create'>Generate Key?</a>");
                var create = model.find(".error").find("#create");
                create.click(function() {
                    gun.SEA.pair().then((pair) => {
                        pair = JSON.stringify(pair);
                        model.find("#pubkey").val(pair).focusout(() => model.find("#pubkey").attr("type", "password")).focusin(() => model.find("#pubkey").attr("type", "text")).focus().select();
                        model.find(".error").css("color", "red").html("<b>COPY PAIR SOMEWHERE SAFE!</b> and click Login");
                        creatingPair = true;
                        // console.log(pair);
                    });
                });
                return;
            }

            gun.user().auth(pair, async function(res) {
                if (!res.err) {
                    if (login.user) {
                        if (creatingPair) {
                            creatingPair = false;
                            await gun.user().get("pub").put(pair.pub);
                            await gun.user().get("epub").put(pair.epub);
                            await gun.user().get("alias").put("~" + pair.pub);
                        }
                        model.modal("hide");
                        login.prepLogout();
                        imports.app.emit("login", login.user);
                    }
                }
            });

        };

        var $login_hardware = async(tag, pasconfm) => {
            if (!imports.app.nw_app || !imports.app.nw_app.is_localhost)
                ONLYKEY((OK) => {
                    var ok = OK();
                    ok_login(ok);
                });
            else
                ok_login(imports.app.nw_app.onlykey);

            function ok_login(ok) {
                if (!tag) tag = "";

                ok.derive_public_key(tag, 1, false, (err, key) => {
                    ok.derive_shared_secret(tag, key, 1, false, (err, sharedsec, key2) => {
                        $login(tag, sharedsec, createAccount == tag ? sharedsec : false);
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
                        model.find(".error").text("");
                        model.find("#tag_error").text("");
                        model.find("#pubkey_error").text("");
                        model.find("#password_error").text("");
                        model.find("#confirm-password_error").text("");
                        model.find("#confirm-password").val("");
                        model.find("#confirmpwfield").hide();
                    }
                }
            }

            if (usr && pas) {
                login.getUserPub(usr, function(error, usr_pub) {
                    gun.user().auth(usr_pub || usr, pas, function(res) {
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
                                // var uid = false;
                                // if (usr.indexOf("#") > -1) {
                                //     usr = usr.split("#");
                                //     uid = usr[1];
                                //     usr = usr[0];
                                // }
                                // gun.aliasToPub("@" + usr, uid, (pub) => {
                                //     if (!pub) {
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
                                    model.find(".error").css("color", "red").html("<b>" + res.err + "</b>&nbsp;<a href='javascript:' id='create'>Create User?</a>");
                                    var create = model.find(".error").find("#create");
                                    create.click(function() {
                                        model.find("#confirmpwfield").show().focus();
                                        model.find("#login_alias").text("Create Account");
                                        model.find(".error").text("Creating Account");
                                        createAccount = usr;
                                    });
                                }
                                //     }
                                //     else {
                                //         model.find(".error").css("color", "red").html("<b>" + res.err + "</b>");
                                //     }
                                // });
                            }
                        }

                    });

                })
            }

        };

        model.find("#login_alias").click(() => {
            var usr = model.find("#username").val();
            var pas = model.find("#password").val();
            var pasconfm = model.find("#confirm-password").val();
            $login(usr, pas, pasconfm);
        });

        model.find("#login_onlykey-usb").click(() => {
            var tag = model.find("#tag").val();
            $login_hardware(tag);
        });

        model.find("#login_pubkey").click(() => {
            var tag = model.find("#pubkey").val();
            $login_pubkey(tag);
        });
    };

    login.openLogin_ = function(done) {

        var model = $(loginModel);

        model.modal({
            show: true,
            backdrop: 'static',
            keyboard: false
        });

        var createAccount = false;
        var creating = false;
        var creatingPair = false;

        var canceled = false;

        model.find(".close-modal").click(function() {
            if (!createAccount) {
                canceled = true;
                model.modal('hide');
            }
            else {
                createAccount = false;
                model.find(".error").text("");
                model.find("#confirmpwfield").hide().val("");
                model.find("#password").val("");
                model.find("#login_alias").text("Login");
            }
        });
        model.on("hide.bs.modal", function() {
            if (done)
                return done(canceled);
            // if (imports.app.state.lastHash)
            //     imports.app.state.hash = imports.app.state.lastHash;
            // else {
            //     if (imports.app.state.history.length > 0)
            imports.app.state.history.back();
            // else {
            //     imports.app.state.hash = "/";
            // }
            // }
        });
        model.on("hidden.bs.modal", () => {
            model.modal("dispose");
            model.remove();
        });
        model.on("shown.bs.modal", () => {

            model.find("#username").focus();
        });

        model.find("#auth_apparatus").change(function() {
            if (createAccount)
                model.find("#cancel").click();

            model.find(".error").text("");

            model.find("#pubkey").attr("type", "password");

            var value = $(this).val();

            model.find(".login_ALIAS").hide();
            model.find(".login_ONLYKEY-USB").hide();
            model.find(".login_PUBKEY").hide();

            model.find(".login_" + value).show();

        });
        model.find("#auth_apparatus").change();

        model.find("#username").keyup(function(event) {
            if (event.keyCode == 13) { //enter
                model.find("#login_alias").click();
            }
        });
        model.find("#password").keyup(function(event) {
            if (event.keyCode == 13) { //enter
                model.find("#login_alias").click();
            }
        });

        model.find("#tag").keyup(function(event) {
            if (event.keyCode == 13) { //enter
                model.find("#login_onlykey-usb").click();
            }
        });

        var $login_pubkey = async(pair) => {
            model.find("#pubkey").attr("type", "password");

            try {
                if (pair == "") throw ("Faile to load Key")
                pair = JSON.parse(pair);
            }
            catch (e) {
                // model.find(".error").text("Faile to load Key");
                model.find(".error").css("color", "red").html("<b>Faile to load Key.</b>&nbsp;<a href='javascript:' id='create'>Generate Key?</a>");
                var create = model.find(".error").find("#create");
                create.click(function() {
                    gun.SEA.pair().then((pair) => {
                        pair = JSON.stringify(pair);
                        model.find("#pubkey").val(pair).focusout(() => model.find("#pubkey").attr("type", "password")).focusin(() => model.find("#pubkey").attr("type", "text")).focus().select();
                        model.find(".error").css("color", "red").html("<b>COPY PAIR SOMEWHERE SAFE!</b> and click Login");
                        creatingPair = true;
                        // console.log(pair);
                    });
                });
                return;
            }

            gun.user().auth(pair, async function(res) {
                if (!res.err) {
                    if (login.user) {
                        if (creatingPair) {
                            creatingPair = false;
                            await gun.user().get("pub").put(pair.pub);
                            await gun.user().get("epub").put(pair.epub);
                            await gun.user().get("alias").put("~" + pair.pub);
                        }
                        model.modal("hide");
                        login.prepLogout();
                        imports.app.emit("login", login.user);
                    }
                }
            });

        };

        var $login_hardware = async(tag, pasconfm) => {
            if (!imports.app.nw_app || !imports.app.nw_app.is_localhost)
                ONLYKEY((OK) => {
                    var ok = OK();
                    ok_login(ok);
                });
            else
                ok_login(imports.app.nw_app.onlykey);

            function ok_login(ok) {
                if (!tag) tag = "";

                ok.derive_public_key(tag, 1, false, (err, key) => {
                    ok.derive_shared_secret(tag, key, 1, false, (err, sharedsec, key2) => {
                        $login(tag, sharedsec, createAccount == tag ? sharedsec : false);
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
                        model.find(".error").text("");
                        model.find("#tag_error").text("");
                        model.find("#pubkey_error").text("");
                        model.find("#password_error").text("");
                        model.find("#confirm-password_error").text("");
                        model.find("#confirm-password").val("");
                        model.find("#confirmpwfield").hide();
                    }
                }
            }

            if (usr && pas) {
                login.getUserPub(usr, function(error, usr_pub) {
                    gun.user().auth(usr_pub || usr, pas, function(res) {
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
                                // var uid = false;
                                // if (usr.indexOf("#") > -1) {
                                //     usr = usr.split("#");
                                //     uid = usr[1];
                                //     usr = usr[0];
                                // }
                                // gun.aliasToPub("@" + usr, uid, (pub) => {
                                //     if (!pub) {
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
                                    model.find(".error").css("color", "red").html("<b>" + res.err + "</b>&nbsp;<a href='javascript:' id='create'>Create User?</a>");
                                    var create = model.find(".error").find("#create");
                                    create.click(function() {
                                        model.find("#confirmpwfield").show().focus();
                                        model.find("#login_alias").text("Create Account");
                                        model.find(".error").text("Creating Account");
                                        createAccount = usr;
                                    });
                                }
                                //     }
                                //     else {
                                //         model.find(".error").css("color", "red").html("<b>" + res.err + "</b>");
                                //     }
                                // });
                            }
                        }

                    });

                })
            }

        };

        model.find("#login_alias").click(() => {
            var usr = model.find("#username").val();
            var pas = model.find("#password").val();
            var pasconfm = model.find("#confirm-password").val();
            $login(usr, pas, pasconfm);
        });

        model.find("#login_onlykey-usb").click(() => {
            var tag = model.find("#tag").val();
            $login_hardware(tag);
        });

        model.find("#login_pubkey").click(() => {
            var tag = model.find("#pubkey").val();
            $login_pubkey(tag);
        });

    };

    login.userLogout = function() {
        gun.user().leave();
        setTimeout(function() {
            window.location = "/";
        });
    };


    login.getUserPub = function(alias, uid, callback) {
        if (typeof uid == "function") {
            callback = uid;
            uid = false
        }

        if (!uid) {
            var $id = alias.split("#")
            if ($id[1]) {
                alias = $id[0];
                uid = $id[1];
            }
        }

        if (alias.indexOf("@") != 1)
            alias = "@" + alias;


        gun.user(alias).once((data, a, b, c) => {
            var count = 0;
            for (var i in data) {
                if (i.indexOf("~") == 0) {
                    if (uid) {
                        var check_uid = imports.generateUID32(i);
                        if (uid == check_uid)
                            return next(i);
                    }
                    count += 1;
                    // else
                    //     return callback(i);
                }
            }
            callback(count);
        });

        function next(pub) {
            if (!pub)
                return callback();
            gun.get(pub).once(function(data) {
                if (!data || !data.pub || !data.epub) return callback(-1);

                callback(0, { pub: data.pub, epub: data.epub });
            });

        }
    };


    return login;
};
