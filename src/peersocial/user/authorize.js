/* global $ */

module.exports = function(imports, login, keychain) {
    var gun = imports.gun;

    var crypto = require("crypto");
    var url = require("url");
    var querystring = require('querystring');


    var enable_useOCAuth = true;
    var useOCAuth_domain = "www.peersocial.io";

    if (imports.app.debug){
        // if (window.location.hostname == "localhost") { useOCAuth_domain = "localhost";
            enable_useOCAuth = false; 
        // }
    }

    var dapp_info = imports.app.dapp_info;

    var authorize = function() {
        var useOAuth = false;

        var hostname = window.location.hostname;

        if (enable_useOCAuth)
            if (!imports.app.state.query.auth && hostname != "www.peersocial.io" /*&& hostname != "localhost" */ ) useOAuth = true;

        var dapp_pub_hash = crypto.createHash('sha256').update(dapp_info.pub).digest('hex');



        if (login.will_authorize) {
            hostname = imports.app.state.query.auth.split(":")[0];
            var domain = imports.app.state.query.auth;

            var hostname_hash = crypto.createHash('sha256').update(domain).digest('hex');

            if (!login.user) {
                // imports.app.on("login", () => {
                //     authorize();
                // });
                gun.user().recall({
                    sessionStorage: false
                });
                gun.user().leave();

                login.openLogin(function(canceled) {
                    if (canceled) {
                        window.location = "https://" + domain + "/blank.html?canceled=true";
                    }
                    else {
                        authorize();
                    }
                });
            }
            else {
                // keychain("test").then((room) => {
                var main_user = login.user()._.sea;


                imports.app.sea.certify(
                    imports.app.state.query.pub, // everybody is allowed to write
                    { "*": hostname_hash, "+": "*" }, // to the path that starts with 'profile' and along with the key has the user's pub in it
                    main_user, //authority
                    null, //no need for callback here
                    { expiry: Date.now() + (60 * 60 * 24 * 1000) } // Let's set a one day expiration period
                ).then(async(cert) => {
                    console.log(cert);
                    var d = await imports.app.sea.encrypt(cert, await imports.app.sea.secret(imports.app.state.query.epub, login.user()._.sea)); // pair.epriv will be used as a passphrase

                    var query = {
                        cert: new Buffer(d).toString("base64"),
                        pub: main_user.pub,
                        epub: main_user.epub,
                    };
                    query = querystring.stringify(query);

                    gun.user().leave();
                    window.sessionStorage.clear();

                    setTimeout(function() {
                        window.location = "https://" + domain + "/blank.html?" + query;
                    }, 1000)

                });
                // });
            }
            return true;
        }


        if (useOAuth) {

            keychain().then((temp_dapp_user) => {

                gun.user().auth(temp_dapp_user, function(res) {
                    gun.user().get("profile").get("seen").put(new Date().getTime()).once(function() {
                        var domain = useOCAuth_domain;

                        if (domain == "localhost" && hostname == "localhost") domain = window.location.host;
                        else if (domain == "localhost" && hostname != "localhost") domain = "www.peersocial.com";

                        domain = 'https://' + domain;

                        var popupOptions = "popup,location=1,toolbar=1,menubar=1,resizable=1,height=800,width=600";
                        var query = {
                            auth: window.location.host,
                            dapp: dapp_pub_hash,
                            pub: temp_dapp_user.pub,
                            epub: temp_dapp_user.epub,
                        };
                        query = querystring.stringify(query);
                        var _url = domain + '/login?' + query;
                        var popup = window.open(_url, 'auth', popupOptions);

                        var interval = setInterval(function() {
                            if (popup.closed !== false) {
                                gun.user().leave();
                                clearInterval(interval);
                                imports.app.state.history.back();
                                // imports.app.state.history.reload();
                                return;
                            }

                            try {
                                (popup.location.pathname == "/blank.html");
                            }
                            catch (e) { return; }

                            // var message = (new Date().getTime());
                            // proxy.postMessage(message, domain); //send the message and target URI
                            if (popup.location.pathname == "/blank.html" && popup.location.host == window.location.host) {
                                var query = url.parse(popup.location.href, true).query;
                                if (query.cert) {
                                    (async() => {
                                        query.cert = Buffer.from(query.cert, "base64").toString("utf8");
                                        query.cert = await imports.app.sea.decrypt(query.cert, await imports.app.sea.secret(query.epub, temp_dapp_user));
                                        login.user_cert = query;

                                        if (login.user) {
                                            gun.user().get("profile").get("seen").put(new Date().getTime()).once(function() {

                                                login.prepLogout();
                                                imports.app.emit("login", login.user);
                                                imports.app.state.history.back();
                                            });
                                        }

                                    })();
                                }
                                else {
                                    gun.user().leave();
                                    imports.app.state.history.back();
                                }
                                clearInterval(interval);
                                popup.close();
                            }
                        }, 500);
                    });
                });
            });
            return true;
        }
        return false;
    }

    Object.defineProperty(login, 'will_authorize', {
        get() {
            return !!(imports.state.query.auth && imports.state.query.pub && imports.state.query.epub);
        }
    });

    return authorize;
};
