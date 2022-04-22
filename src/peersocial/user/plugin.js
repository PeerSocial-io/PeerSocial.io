define(function(require, exports, module) {

    appPlugin.consumes = ["app", "gun", "provable"];
    appPlugin.provides = ["user"];

    /* global $ */

    var keychain = require("./key_chain.js");

    var loginModel = require("./login-model.html");

    var ONLYKEY = require("@trustcrypto/node-onlykey/src/onlykey-api");

    var hostname = window.location.hostname;

    return appPlugin;

    function appPlugin(options, imports, register) {

        var generateUID32 = function(pub) {
            return imports.provable.toInt(imports.provable.sha256(pub)).toString().substring(0, 4);
        };
        var gun = imports.gun;

        function userLogout() {
            gun.user().leave();
            setTimeout(function() {
                window.location = "/";
            });


            //we have a bug bug with gun

            //imports.app.state.history.setHash("home");


            // $("#navbar-nav-right").find("#logout_btn").remove();
            // $("#navbar-nav-right").html(
            //     imports.app.layout.ejs.render('<li class="nav-item active" id="login_btn"><a class="nav-link" href="#login"><%= login %><span class="sr-only"></span></a></li>', { login: "Login" })
            // );
            // imports.app.emit("logout");
        }

        function prepLogout() {
            $("#navbar-nav-right").find("#login_btn").remove();

            $("#navbar-nav-right").html(
                imports.app.layout.ejs.render('<li class="nav-item active" id="logout_btn"><a class="nav-link" href="/logout"><%= Logout %><span class="sr-only"></span></a></li>', { Logout: "Logout" })
            );
        }

        function openLogin() {

            var model = $(loginModel);

            model.modal({
                show: true
            });

            model.on("hide.bs.modal", function() {
                if (imports.app.state.lastHash)
                    imports.app.state.hash = imports.app.state.lastHash;
                else imports.app.state.history.back();


            });
            model.on("hidden.bs.modal", () => {
                model.modal("dispose");
                model.remove()
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
                if (!imports.app.nw_app)
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
                            if (gun.user().is) {
                                model.modal("hide");
                                prepLogout();
                                me((err, $me, $user) => {
                                    if (err) console.log(err);
                                    var uid32 = generateUID32("~" + $me.pub);
                                    if (!$me.uid32 || $me.uid32 != uid32) $user.get("uid32").put(uid32);
                                    imports.app.emit("login", $me, $user);

                                });
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
        }

        function changePassword(old, pass, callback) {
            gun.user().auth(gun.user().is.alias, old, (res) => {
                callback(res.err || null, res.err ? null : true);
            }, { change: pass });
        }

        function me(callback) {
            if (gun.user().is) {
                var myPubid = "~" + gun.user().is.pub;
                gun.get(myPubid).once((data) => {
                    if (data) {
                        callback(null, data, gun.user());
                    }
                });
            }
            else callback(new Error("User Not Logged in"));
        }

        function getUser(alias, $uid32, callback) {
            if (typeof $uid32 == "function") {
                callback = $uid32;
                $uid32 = false;
            }
            gun.aliasToPub("@" + alias, $uid32, (pub) => {
                if (gun.user().is && "~" + gun.user().is.pub == pub) {
                    gun.user().once((data) => {
                        if (alias == data.alias) {
                            callback(null, data, gun.user(), true);
                        }
                    });
                }
                else
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

        //-------------------------------------------------

        //a key to let our app know if the session was restored
        var sessionRestored = false;

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
                finishInitialization();
            });
        }
        else {
            //we did not have a session to restore, so lets tell the the next session login to save
            gun.user().recall({
                sessionStorage: true
            });
            //finish your app startup
            finishInitialization();
        }

        // doing gun.user().leave();  will clear the 'window.sessionStorage.recall' and logout the user

        //-------------------------------------------------

        function authrize_auth() {
            var useOAuth = false;
            if (!imports.app.state.query.auth && hostname != "www.peersocial.io" /*&& hostname != "localhost" */ )
                useOAuth = true;


            if (imports.app.state.query.auth && imports.app.state.query.pub && imports.app.state.query.epub) {
                if (!gun.user().is) {
                    imports.app.on("login", ($me, $user) => {
                        authrize_auth();
                    });
                    openLogin();
                }
                else {
                    // keychain("test").then((room) => {
                    var room = gun.user()._.sea;
                    imports.app.sea.certify(
                        imports.app.state.query.pub, // everybody is allowed to write
                        { "*": "notifications", "+": "*" }, // to the path that starts with 'profile' and along with the key has the user's pub in it
                        room, //authority
                        null, //no need for callback here
                        { expiry: Date.now() + (60 * 60 * 24 * 1000) } // Let's set a one day expiration period
                    ).then(async(cert) => {
                        console.log(cert);
                        var d = await imports.app.sea.encrypt(cert, await imports.app.sea.secret(imports.app.state.query.epub, gun.user()._.sea)); // pair.epriv will be used as a passphrase
                        window.location = "https://" + imports.app.state.query.auth + "/blank.html?epub=" + room.epub + "&cert=" + (new Buffer(d).toString("base64"));
                    });
                    // });
                }
                return true;
            }


            if (useOAuth) {

                keychain().then((room) => {

                    var domain;
                    if (hostname == "localhost")
                        domain = window.location.host;
                    else
                        domain = "www.peersocial.io";

                    domain = 'https://' + domain;
                    var popupOptions = { popup: true , height: 800 };
                    var popup = window.open(domain + '/login?' + 'auth=' + window.location.host + "&" + "pub=" + room.pub + "&" + "epub=" + room.epub, 'oauth', popupOptions);

                    var interval = setInterval(function() {

                        // var message = (new Date().getTime());
                        // proxy.postMessage(message, domain); //send the message and target URI
                        if (popup.location.pathname == "/blank.html") {
                            var url = require("url");
                            var query = url.parse(popup.location.href, true).query;
                            var cert = query.cert;
                            if (cert) {
                                (async() => {
                                    cert = Buffer.from(cert, "base64").toString("utf8");
                                    cert = await imports.app.sea.decrypt(cert, await imports.app.sea.secret(query.epub, room));
                                    query.cert = cert;
                                    console.log(query);
                                    gun.user().auth(room, function(res) {})
                                })();
                            }
                            clearInterval(interval);
                            popup.close();
                        }
                    }, 500);
                });
                return true;
            }
            return false;
        }

        function finishInitialization() {

            register(null, {
                user: {
                    keychain: keychain,
                    init: function() {


                        imports.app.state.$hash.on("login", function() {
                            if (!authrize_auth() && !gun.user().is) {
                                openLogin();
                            }

                        });

                        imports.app.state.$hash.on("logout", function() {
                            userLogout();
                        });

                        $("#navbar-nav-right").append(
                            imports.app.layout.ejs.render('<li class="nav-item active" id="login_btn"><a class="nav-link" href="/login"><%= login %><span class="sr-only"></span></a></li>', { login: "Login" })
                        );

                        if (gun.user().is)
                            prepLogout();

                        imports.app.on("start", () => {
                            if (sessionRestored) {
                                me((err, $me, $user) => {
                                    if (err) console.log(err);
                                    imports.app.emit("login", $me, $user);
                                });
                            }


                        });

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