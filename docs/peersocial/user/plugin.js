define(function(require, exports, module) {

    appPlugin.consumes = ["app", "gun", "provable", "layout", "state", "gunMask"];
    appPlugin.provides = ["user"];

    /* global $ */
    return appPlugin;

    function appPlugin(options, imports, register) {

        var generateUID32 = function(pub) {
            if (pub[0] != "~") pub = "~" + pub;
            return imports.provable.toInt(imports.provable.sha256(pub)).toString().substring(0, 4);
        };

        imports.generateUID32 = generateUID32;

        var keychain = require("./key_chain.js");
        var login = require("./login.js")(imports);
        var authorize = require("./authorize.js")(imports, login, keychain);

        var gun = imports.gun;

        function changePassword(old, pass, callback) {
            if (login.user)
                gun.user().auth(login.user().is.alias, old, (res) => {
                    callback(res.err || null, res.err ? null : true);
                }, { change: pass });
            else {
                callback(null); //fail
            }
        }

        function me(callback) {
            if (login.user) {
                login.user().once(function(data) {
                    if (!data) data = {};
                    var $data = JSON.parse(JSON.stringify(data));
                    $data.uid32 = generateUID32(login.user().is.pub);
                    $data.alias = data.alias || login.user().is.pub;
                    $data.pub = data.pub || login.user().is.pub;
                    callback(null, $data, login.user);
                });
            }
            else callback(new Error("User Not Logged in"));
        }

        function getUser(alias, $uid32, callback) {
            if (typeof $uid32 == "function") {
                callback = $uid32;
                $uid32 = false;
            }

            if (alias[0] == "~")
                alias = { pub: alias.substring(1) };

            if (typeof alias == "object") {
                withPub(alias.pub);
            }
            else {
                gun.aliasToPub("@" + alias, $uid32, withPub);
            }


            function withPub(pub) {
                if (login.user && login.user().is.pub == pub) {
                    me((err, data, user) => {
                        callback(err, JSON.parse(JSON.stringify(data)), user, true);
                    });
                }
                else
                if (pub) {
                    gun.get("~" + pub).once((data) => {
                        callback(null, JSON.parse(JSON.stringify(data)), () => { return gun.get("~" + pub); });
                    });
                }
                else {
                    callback(new Error("User Not Found"));
                }
            }
        }

        function finishInitialization() {

            register(null, {
                user: {
                    keychain: keychain,
                    init: function() {


                        imports.app.state.$hash.on("/login", function(args, currentState, lastState, onDestroy) {
                            if (!login.user && !authorize()) {
                                login.openLogin(false, onDestroy);
                            }
                            if (login.user && !authorize()) {
                                login.prepLogout();
                                imports.app.state.history.back();
                            }
                        });

                        imports.app.state.$hash.on("/logout", function(args, currentState, lastState, onDestroy) {
                            login.userLogout();
                        });


                        login.prepLogin();

                        if (login.user)
                            login.prepLogout();

                    },
                    uid: generateUID32,
                    login: login,
                    changePassword: changePassword,
                    me: me,
                    getUser: getUser
                }
            });

        }

        login.restoreSession(finishInitialization);
    }

});